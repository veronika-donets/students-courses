import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import {
    assignInstructorToCourse,
    createCourse,
    findAvailableCourses,
    findCoursesByInstructorId,
    findStartedCourses,
    getCourseById,
    getCourseWithContains,
    getCourseWithLessonsById,
    removeCourseWithContains,
    unassignInstructorFromCourse,
    updateCourse,
} from '../models/course'
import { getUserById, getUserIdFromToken } from '../models/user'
import Lodash from 'lodash'
import { createResult, getAllResultsByStudentId } from '../models/result'

const router = Router()

router.post('/create', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id, title, description } = await createCourse(req.body)

        res.json({ id, title, description })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.put('/update', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { courseId, title, description } = req.body

        await updateCourse(courseId, title, description)

        res.json({ message: 'Course successfully updated' })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.put('/assign', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { courseId, instructorId } = req.body

        const user = await getUserById(instructorId)

        if (!user) {
            return res.status(404).json({ message: 'Instructor not found' })
        } else if (user.role !== USER_ROLES.INSTRUCTOR) {
            return res.status(400).json({ message: 'User is not an instructor' })
        }

        const course = await getCourseById(courseId)

        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const isInstructorAssigned = course.instructorIds.includes(instructorId)

        if (isInstructorAssigned) {
            return res
                .status(400)
                .json({ message: 'This instructor is already assigned to the course' })
        }

        await assignInstructorToCourse(courseId, instructorId)

        res.json({ message: 'Instructor successfully assigned' })
    } catch {
        res.status(400).json({ message: 'Cannot assign user' })
    }
})

router.put('/unassign', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { courseId, instructorId } = req.body

        const user = await getUserById(instructorId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const course = await getCourseById(courseId)

        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const isInstructorAssigned = course.instructorIds.includes(instructorId)

        if (!isInstructorAssigned) {
            return res
                .status(400)
                .json({ message: 'This instructor is not assigned to the course' })
        }

        await unassignInstructorFromCourse(courseId, instructorId)

        res.json({ message: 'Instructor successfully unassigned' })
    } catch {
        res.status(400).json({ message: 'Cannot unassign user' })
    }
})

router.post('/start', passport.authenticate([USER_ROLES.STUDENT]), async (req, res) => {
    try {
        const { jwt } = req.headers
        const { courseId } = req.body

        if (!courseId) {
            return res.status(400).json({ message: 'Course id is not provided' })
        }

        const studentId = await getUserIdFromToken(jwt)

        if (!studentId) {
            return res.status(404).json({ message: 'Student not found' })
        }

        const findAllStartedCourses = await getAllResultsByStudentId(studentId)

        const isStarted = findAllStartedCourses.find((el) => el.courseId === courseId)

        if (isStarted) {
            return res.status(400).json({ message: 'Course is already started' })
        }

        if (findAllStartedCourses.length >= 5) {
            return res.status(400).json({
                message: `You already have ${findAllStartedCourses.length} in progress. 
                    Complete at least one of them to take another`,
            })
        }

        const course = await getCourseWithLessonsById(courseId)

        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        if (course.Lessons.length < 5) {
            return res.status(403).json({ message: 'Course is inactive' })
        }

        const isInstructorAssigned = !Lodash.isEmpty(course.instructorIds)

        if (!isInstructorAssigned) {
            return res.status(400).json({ message: 'Instructor is not assigned' })
        }

        await createResult(courseId, studentId)

        res.json({ message: 'Course successfully started' })
    } catch {
        res.status(400).json({ message: 'Cannot start course' })
    }
})

router.get('/available', async (req, res) => {
    // For admin all courses is available
    // For all authorized and unauthorized users all prepared courses (contains >= 5 lessons) is available

    try {
        const { limit, offset } = req.query
        const { jwt } = req.headers

        let isAdmin = false

        if (jwt) {
            const id = await getUserIdFromToken(jwt)
            const { role } = await getUserById(id)
            if (role === USER_ROLES.ADMIN) {
                isAdmin = true
            }
        }

        const isActiveCourses = !(jwt && isAdmin)
        const courses = await findAvailableCourses(limit, offset, isActiveCourses)

        res.json({ courses })
    } catch {
        res.status(400).json({ message: 'Cannot get courses' })
    }
})

router.get('/', async (req, res) => {
    // For admin all courses is available
    // For all authorized and unauthorized users all prepared courses (contains >= 5 lessons) is available

    try {
        const { id } = req.query
        const { jwt } = req.headers

        let isAdmin = false

        if (jwt) {
            const id = await getUserIdFromToken(jwt)
            const { role } = await getUserById(id)
            if (role === USER_ROLES.ADMIN) {
                isAdmin = true
            }
        }

        const course = await getCourseWithLessonsById(id)

        if (!isAdmin && course.Lessons.length < 5) {
            return res.status(403).json({ message: 'You are not authorized to see this course' })
        }

        res.json({ course })
    } catch {
        res.status(400).json({ message: 'Cannot get course' })
    }
})

router.get(
    '/my',
    passport.authenticate([USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR]),
    async (req, res) => {
        try {
            const { jwt } = req.headers
            const userId = await getUserIdFromToken(jwt)
            const { role } = await getUserById(userId)

            if (role === USER_ROLES.INSTRUCTOR) {
                const courses = await findCoursesByInstructorId(userId, role)

                return res.json({ courses })
            }

            const courses = await findStartedCourses(userId)

            res.json({ courses })
        } catch {
            res.status(400).json({ message: 'Cannot get courses' })
        }
    }
)

router.delete('/', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id } = req.query
        const course = await getCourseWithContains(id)

        if (!course) {
            res.status(404).json({ message: 'Course not found' })
        }

        await removeCourseWithContains(course)

        res.json({ message: 'Course has been successfully removed' })
    } catch {
        res.status(400).json({ message: 'Cannot delete course' })
    }
})

export default router
