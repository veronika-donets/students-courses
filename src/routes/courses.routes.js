import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import {
    assignInstructorToCourse,
    completeCourse,
    createCourse,
    findAvailableCourses,
    findCoursesByUserId,
    findStartedCourses,
    getCourseById,
    startCourse,
    unassignInstructorFromCourse,
} from '../models/course'
import { getUserById, getUserIdFromToken } from '../models/user'
import Lodash from 'lodash'

const router = Router()

router.post('/create', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { title, description } = await createCourse(req.body)

        res.json({ title, description })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.post('/assign', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { courseId, instructorId } = req.body

        const user = await getUserById(instructorId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
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

        const result = await assignInstructorToCourse(courseId, instructorId)

        if (!result) {
            return res.status(400).json({ message: 'Cannot assign instructor' })
        }

        res.json({ message: 'Instructor successfully assigned' })
    } catch {
        res.status(400).json({ message: 'Cannot assign user' })
    }
})

router.post('/unassign', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
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

        const result = await unassignInstructorFromCourse(courseId, instructorId)

        if (!result) {
            return res.status(400).json({ message: 'Cannot unassign instructor' })
        }

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

        const findAllStartedCourses = await findStartedCourses(studentId)

        if (findAllStartedCourses.length >= 5) {
            return res.status(400).json({
                message: `You already have ${findAllStartedCourses.length} in progress. 
                    Complete at least one of them to take another`,
            })
        }

        const course = await getCourseById(courseId)

        if (course.lessonsIds.length < 5) {
            return res.status(400).json({ message: 'Course is inactive' })
        }

        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const isInstructorAssigned = !Lodash.isEmpty(course.instructorIds)

        if (!isInstructorAssigned) {
            return res.status(400).json({ message: 'Instructor is not assigned' })
        }

        const isStarted = course.startedIds.includes(studentId)

        if (isStarted) {
            return res.status(400).json({ message: 'Course is already started' })
        }

        const result = await startCourse(courseId, studentId)

        if (!result) {
            return res.status(400).json({ message: 'Cannot start course' })
        }

        res.json({ message: 'Course successfully started' })
    } catch {
        res.status(400).json({ message: 'Cannot start course' })
    }
})

router.post('/complete', passport.authenticate([USER_ROLES.STUDENT]), async (req, res) => {
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

        const course = await getCourseById(courseId)

        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const isStarted = course.startedIds.includes(studentId)

        if (!isStarted) {
            return res.status(400).json({ message: 'Course is not started' })
        }

        //TODO: Check if all lessons completed, generate final mark.
        const result = await completeCourse(courseId, studentId)

        if (!result) {
            return res.status(400).json({ message: 'Cannot complete course' })
        }

        res.json({ message: 'Course successfully completed' })
    } catch {
        res.status(400).json({ message: 'Cannot complete course' })
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

router.get(
    '/my',
    passport.authenticate([USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR]),
    async (req, res) => {
        try {
            const { jwt } = req.headers
            const userId = await getUserIdFromToken(jwt)
            const { role } = await getUserById(userId)
            const courses = await findCoursesByUserId(userId, role)

            const mappedCourses = courses.map((course) => {
                const {
                    id,
                    title,
                    description,
                    instructorIds,
                    lessonsIds,
                    startedIds,
                    completedIds,
                } = course
                const isStarted = Boolean(startedIds.includes(userId))
                const isCompleted = Boolean(completedIds.includes(userId))

                return {
                    id,
                    title,
                    description,
                    instructorIds,
                    lessonsIds,
                    isStarted,
                    isCompleted,
                }
            })

            // TODO: Add status if student passed the course, mark and feedback

            res.json({ courses: mappedCourses })
        } catch {
            res.status(400).json({ message: 'Cannot get courses' })
        }
    }
)

router.get('/', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
    } catch {}
})

export default router
