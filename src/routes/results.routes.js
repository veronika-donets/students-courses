import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import {
    getResultByCredentials,
    getStudentsPerCourse,
    updateFeedback,
} from '../services/result.service'

const router = Router()

router.put(
    '/feedback',
    passport.authenticate([USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { courseId, studentId, feedback } = req.body

            if (!feedback) {
                return res.status(404).json({ message: 'Feedback is not provided' })
            }

            if (!courseId || !studentId) {
                return res.status(404).json({ message: 'Parameters are not provided' })
            }

            const result = await getResultByCredentials(courseId, studentId)

            if (!result) {
                return res.status(404).json({ message: 'Course result not found' })
            }

            if (!result.finalMark) {
                return res
                    .status(400)
                    .json({ message: 'Feedback can be given only for completed course' })
            }

            await updateFeedback(result.id, feedback)

            res.json({ message: 'Feedback has been successfully given' })
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
)

router.get(
    '/',
    passport.authenticate([USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { courseId } = req.query

            if (!courseId) {
                return res.status(404).json({ message: 'Course Id is not provided' })
            }

            const studentList = await getStudentsPerCourse(courseId)
            const students = studentList.map((el) => el.User)

            res.json({ students })
        } catch (e) {
            res.status(500).json({ message: 'Cannot get students' })
        }
    }
)

export default router
