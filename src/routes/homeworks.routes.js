import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import multer from 'multer'
import { cleanUploadsFolder, createUploadedFile, removeFile } from '../models/file'
import { getUserById, getUserIdFromToken } from '../models/user'
import {
    createHomework,
    getHomeworkById,
    getHomeworkByCredentials,
    putMark,
    removeHomework,
    removeMark,
    updateHomework,
} from '../models/homework'
import { addHomeworkIdToLesson, getLessonById, removeHomeworkIdFromLesson } from '../models/lesson'
import Lodash from 'lodash'

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

            if (!lessonId) {
                return res.status(400).json({ message: 'Lesson id is not provided' })
            }

            const studentId = await getUserIdFromToken(jwt)

            if (!studentId) {
                return res.status(404).json({ message: 'Student not found' })
            }

            const lesson = await getLessonById(lessonId)

            if (!lesson) {
                return res.status(400).json({ message: 'Lesson with provided id is not exist' })
            }

            const existedHomework = await getHomeworkByCredentials(lessonId, studentId)

            if (existedHomework) {
                return res
                    .status(400)
                    .json({ message: 'You already have homework submitted to this lesson' })
            }

            const createdFiles = await Promise.all(files.map((file) => createUploadedFile(file)))

            const fileIds = createdFiles.map((file) => file.id)

            const homework = await createHomework(lessonId, studentId, fileIds, comment)

            await addHomeworkIdToLesson(lessonId, homework.id)

            res.json({
                id: homework.id,
                lessonId: homework.lessonId,
                studentId: homework.studentId,
                uploadedFileIds: homework.uploadedFileIds,
                comment: homework.comment,
            })
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.get(
    '/:id',
    passport.authenticate([USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { id: homeworkId } = req.params
            const { jwt } = req.headers

            if (!homeworkId) {
                return res.status(400).json({ message: 'Homework id is not provided' })
            }

            const userId = await getUserIdFromToken(jwt)

            if (!userId) {
                return res.status(404).json({ message: 'User not found' })
            }

            const { role } = getUserById(userId)

            const homework = await getHomeworkById(homeworkId)

            if (!homework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            if (role === USER_ROLES.STUDENT && homework.studentId !== userId) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

            const { id, lessonId, studentId, uploadedFileIds, comment, mark } = homework

            res.json({ id, lessonId, studentId, uploadedFileIds, comment, mark })
        } catch {
            res.status(400).json({ message: 'Cannot get homework' })
        }
    }
)

router.post(
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
                return res.status(400).json({ message: 'Homework id is not provided' })
            }

            const studentId = await getUserIdFromToken(jwt)

            if (!studentId) {
                return res.status(404).json({ message: 'Student not found' })
            }

            const existedHomework = await getHomeworkById(homeworkId)

            if (!existedHomework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            if (existedHomework.studentId !== studentId) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

            const createdFiles = await Promise.all(files.map((file) => createUploadedFile(file)))

            const fileIds = createdFiles.map((file) => file.id)

            await updateHomework(homeworkId, fileIds, comment)

            res.json({ message: 'Homework successfully updated' })

            const { uploadedFileIds } = existedHomework

            if (!Lodash.isEmpty(uploadedFileIds)) {
                await Promise.all(uploadedFileIds.map((id) => removeFile(id)))
            }
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.put(
    '/mark',
    passport.authenticate([USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        // The endpoint supports to upload maximum 10 files

        try {
            const { homeworkId, mark } = req.body

            if (!homeworkId) {
                return res.status(400).json({ message: 'Homework id is not provided' })
            }

            if (!mark) {
                return res.status(400).json({ message: 'Mark is not provided' })
            }

            const homework = await getHomeworkById(homeworkId)

            if (!homework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            await putMark(homeworkId, mark)

            res.json({
                message: 'The mark has been given',
            })
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
)

router.delete(
    '/mark',
    passport.authenticate([USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { homeworkId } = req.body

            if (!homeworkId) {
                return res.status(400).json({ message: 'Homework id is not provided' })
            }

            const homework = await getHomeworkById(homeworkId)

            if (!homework) {
                return res.status(404).json({ message: 'Homework not found' })
            }

            await removeMark(homeworkId)

            res.json({
                message: 'Mark has been deleted',
            })
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
)

router.delete('/:id', passport.authenticate([USER_ROLES.STUDENT]), async (req, res) => {
    try {
        const { id } = req.params
        const { jwt } = req.headers

        if (!id) {
            return res.status(400).json({ message: 'Homework id is not provided' })
        }

        const studentId = await getUserIdFromToken(jwt)
        const homework = await getHomeworkById(id)

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' })
        }

        if (homework.studentId !== studentId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        await removeHomework(id)
        await removeHomeworkIdFromLesson(homework.lessonId, id)

        res.json({
            message: 'Homework has been deleted',
        })

        const { uploadedFileIds } = homework
        await Promise.all(uploadedFileIds.map((id) => removeFile(id)))
    } catch (e) {
        res.status(400).json({ message: 'Cannot remove homework' })
    }
})

export default router
