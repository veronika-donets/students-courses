import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import {
    createLesson,
    getLessonWithFilesById,
    getLessonWithFiles,
    updateLesson,
    removeLessonsWithContains,
} from '../models/lesson'
import multer from 'multer'
import { cleanUploadsFolder, createUploadedFile, removeFiles } from '../models/file'
import { getCourseById } from '../models/course'
import Lodash from 'lodash'
import { getUserById, getUserIdFromToken, findLessonInProgressCourses } from '../models/user'

const router = Router()
const upload = multer({ dest: 'uploads/' })

router.post(
    '/create',
    passport.authenticate([USER_ROLES.ADMIN]),
    upload.array('file', 10),
    async (req, res) => {
        // The endpoint supports to upload maximum 10 files

        try {
            const {
                courseId: identifier,
                title: lessonTitle,
                description: lessonDescription,
            } = req.body
            const { files } = req

            const course = await getCourseById(identifier)

            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const { id, courseId, title, description } = await createLesson(
                identifier,
                lessonTitle,
                lessonDescription
            )

            const createdFiles = await Promise.all(
                files.map((file) => createUploadedFile(id, file))
            )
            const fileIds = createdFiles.map((file) => file.id)

            res.json({ id, courseId, title, description, fileIds })
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.get(
    '/',
    passport.authenticate([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]),
    async (req, res) => {
        try {
            const { id } = req.query
            const { jwt } = req.headers

            const userId = await getUserIdFromToken(jwt)
            const user = await getUserById(userId)

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            if (user.role === USER_ROLES.STUDENT) {
                const result = await findLessonInProgressCourses(userId, id)
                const mapped = result.map((el) => el.Course).filter((el) => el !== null)

                if (Lodash.isEmpty(mapped)) {
                    return res
                        .status(403)
                        .json({ message: 'You are not authorized to see this lesson' })
                }
            }

            const lesson = await getLessonWithFilesById(id)

            res.json({ lesson })
        } catch {
            res.status(400).json({ message: 'Cannot get lesson' })
        }
    }
)

router.put(
    '/update',
    passport.authenticate([USER_ROLES.ADMIN]),
    upload.array('file', 10),
    async (req, res) => {
        // The endpoint supports to upload maximum 10 files

        try {
            const { id, title, description } = req.body
            const { files } = req

            if (!id) {
                return res.status(404).json({ message: 'Lesson id is not provided' })
            }

            const lesson = await getLessonWithFilesById(id)

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

            await updateLesson(id, title, description)

            if (!Lodash.isEmpty(files)) {
                await Promise.all(files.map((file) => createUploadedFile(id, file)))

                const uploadedFileIds = lesson.Files.map((el) => el.id)
                await removeFiles(uploadedFileIds)
            }

            res.json({ message: 'Lesson successfully updated' })
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.delete('/', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id } = req.query

        if (!id) {
            return res.status(400).json({ message: 'Lesson id is not provided' })
        }

        const lesson = await getLessonWithFiles(id)

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' })
        }

        await removeLessonsWithContains([lesson])

        res.json({ message: 'Lesson has been successfully removed' })
    } catch {
        res.status(400).json({ message: 'Cannot remove lesson' })
    }
})

export default router
