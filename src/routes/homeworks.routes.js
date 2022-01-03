import { Router } from 'express'
import passport from '../auth'
import { checkUnsupportedFormat, USER_ROLES } from '../helpers'
import multer from 'multer'
import {
    cleanUploadsFolder,
    createUploadedFilesWithS3,
    removeFiles,
} from '../services/file.service'
import { getUserById, getUserIdFromToken } from '../services/user.service'
import {
    createHomework,
    putMark,
    updateHomework,
    getHomeworkWithFilesById,
    getHomeworkWithLessonById,
    getAllHomeworksPerCourse,
    removeHomeworksWithRelations,
} from '../services/homework.service'
import { getLessonWithHomeworkById } from '../services/lesson.service'
import Lodash from 'lodash'
import { getResultByCredentials, updateFinalMark } from '../services/result.service'
import { getCourseWithLessonsById } from '../services/course.service'

const router = Router()
const upload = multer({ dest: 'uploads/' })

router.post(
    '/create',
    passport.authenticate([USER_ROLES.STUDENT]),
    upload.array('file', 10),
    async (req, res) => {
        // The endpoint supports to upload maximum 10 files

        try {
            const { lessonId, comment } = req.body
            const { jwt } = req.headers
            const { files } = req

            const hasUnsupportedFormat = checkUnsupportedFormat(files)

            if (hasUnsupportedFormat) {
                return res.status(400).json({ message: 'Unsupported file format' })
            }

            if (!lessonId) {
                return res.status(400).json({ message: 'Lesson id is not provided' })
            }

            const studentId = await getUserIdFromToken(jwt)

            if (!studentId) {
                return res.status(404).json({ message: 'Student not found' })
            }

            const lesson = await getLessonWithHomeworkById(lessonId, studentId)

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson with provided id is not exist' })
            }

            const isCourseInProgress = await getResultByCredentials(lesson.courseId, studentId)

            if (!isCourseInProgress) {
                return res
                    .status(400)
                    .json({ message: "You haven't started course with this lesson" })
            }

            if (!Lodash.isEmpty(lesson.Homeworks)) {
                return res
                    .status(400)
                    .json({ message: 'You already have homework submitted to this lesson' })
            }

            const homework = await createHomework(lessonId, studentId, comment)

            const uploadedFiles = await createUploadedFilesWithS3(files, homework.id)

            const fileIds = uploadedFiles.map((file) => file.id)

            res.json({
                id: homework.id,
                lessonId: homework.lessonId,
                studentId: homework.studentId,
                comment: homework.comment,
                fileIds,
            })
        } catch (e) {
            res.status(500).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.put(
    '/update',
    passport.authenticate([USER_ROLES.STUDENT]),
    upload.array('file', 10),
    async (req, res) => {
        // The endpoint supports to upload maximum 10 files

        try {
            const { homeworkId, comment } = req.body
            const { jwt } = req.headers
            const { files } = req

            if (!homeworkId) {
                return res.status(404).json({ message: 'Homework id is not provided' })
            }

            const hasUnsupportedFormat = checkUnsupportedFormat(files)

            if (hasUnsupportedFormat) {
                return res.status(400).json({ message: 'Unsupported file format' })
            }

            const studentId = await getUserIdFromToken(jwt)

            if (!studentId) {
                return res.status(404).json({ message: 'Student not found' })
            }

            const existedHomework = await getHomeworkWithFilesById(homeworkId)

            if (!existedHomework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            if (existedHomework.studentId !== studentId) {
                return res
                    .status(403)
                    .json({ message: 'You are not authorized to update this homework' })
            }

            await updateHomework(homeworkId, comment)

            if (!Lodash.isEmpty(files)) {
                await createUploadedFilesWithS3(files, homeworkId)
                const uploadedFileIds = existedHomework.Files.map((el) => el.id)
                await removeFiles(uploadedFileIds)
            }

            res.json({ message: 'Homework successfully updated' })
        } catch (e) {
            res.status(500).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.get(
    '/',
    passport.authenticate([USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { id: homeworkId } = req.query
            const { jwt } = req.headers

            if (!homeworkId) {
                return res.status(404).json({ message: 'Homework id is not provided' })
            }

            const userId = await getUserIdFromToken(jwt)

            if (!userId) {
                return res.status(404).json({ message: 'User not found' })
            }

            const { role } = getUserById(userId)

            const homework = await getHomeworkWithFilesById(homeworkId)

            if (!homework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            if (role === USER_ROLES.STUDENT && homework.studentId !== userId) {
                return res
                    .status(403)
                    .json({ message: 'You are not authorized to see this homework' })
            }

            res.json({ homework })
        } catch {
            res.status(500).json({ message: 'Cannot get homework' })
        }
    }
)

router.put(
    '/mark',
    passport.authenticate([USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { homeworkId, mark } = req.body

            if (!homeworkId) {
                return res.status(404).json({ message: 'Homework id is not provided' })
            }

            if (!mark) {
                return res.status(404).json({ message: 'Mark is not provided' })
            }

            const homework = await getHomeworkWithLessonById(homeworkId)

            if (!homework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            await putMark(homeworkId, mark)

            const { Lesson, studentId } = homework

            // Check if a student submit all homeworks to all lessons per course

            const { Lessons } = await getCourseWithLessonsById(Lesson.courseId)

            const lessonIds = Lessons.map((el) => el.id)
            const homeworks = await getAllHomeworksPerCourse(lessonIds, studentId)
            const marks = homeworks.filter((el) => el.mark).map((el) => el.mark)

            let isAllHomeworkSubmitted = false
            let isCoursePassed = false
            let finalMark = null

            if (lessonIds.length === homeworks.length) {
                isAllHomeworkSubmitted = true
            }

            // Check if all homeworks per course have marks. If yes, put final mark

            if (lessonIds.length === marks.length) {
                finalMark = Math.round(Lodash.sum(marks) / marks.length)
                isCoursePassed = finalMark >= 80

                const result = await getResultByCredentials(Lesson.courseId, studentId)

                if (!result) {
                    return res.status(404).json({ message: 'Course result not found' })
                }

                await updateFinalMark(result.id, finalMark, isCoursePassed)
            }

            res.json({
                message: 'The mark has been given',
                isAllHomeworkSubmitted,
                isCoursePassed,
                finalMark,
            })
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
)

router.delete('/', passport.authenticate([USER_ROLES.STUDENT]), async (req, res) => {
    try {
        const { id } = req.query
        const { jwt } = req.headers

        if (!id) {
            return res.status(404).json({ message: 'Homework id is not provided' })
        }

        const studentId = await getUserIdFromToken(jwt)
        const homework = await getHomeworkWithFilesById(id)

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' })
        }

        if (homework.studentId !== studentId) {
            return res
                .status(403)
                .json({ message: 'You are not authorized to delete this homework' })
        }

        if (homework.mark) {
            return res
                .status(400)
                .json({ message: 'Verified homework with mark cannot be removed' })
        }

        await removeHomeworksWithRelations([homework])

        res.json({
            message: 'Homework has been removed',
        })
    } catch (e) {
        res.status(500).json({ message: 'Cannot remove homework' })
    }
})

export default router
