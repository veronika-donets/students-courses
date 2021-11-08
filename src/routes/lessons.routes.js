import { Router } from 'express'
import passport from '../config/passport'
import { checkUnsupportedFormat, USER_ROLES } from '../helpers'
import {
    createLesson,
    getLessonWithFilesById,
    getLessonWithFiles,
    updateLesson,
    removeLessonsWithRelations,
    findLessonPerCourseByTitle,
    findCourseFromLessonId,
} from '../services/lesson.service'
import multer from 'multer'
import {
    cleanUploadsFolder,
    createUploadedFile,
    createUploadedFilesWithS3,
    removeFilesWithS3,
} from '../services/file.service'
import { getCourseById } from '../services/course.service'
import Lodash from 'lodash'
import { getUserById, getUserIdFromToken } from '../services/user.service'
import { uploadToS3 } from '../services/aws-S3.service'
import { getResultByCredentials } from '../services/result.service'

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

            const hasUnsupportedFormat = checkUnsupportedFormat(files)

            if (hasUnsupportedFormat) {
                return res.status(400).json({ message: 'Unsupported file format' })
            }

            const existingLesson = await findLessonPerCourseByTitle(identifier, lessonTitle)

            if (existingLesson) {
                return res
                    .status(400)
                    .json({ message: 'Lesson with the same title already exists in this course' })
            }

            const course = await getCourseById(identifier)

            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const { id, courseId, title, description } = await createLesson(
                identifier,
                lessonTitle,
                lessonDescription
            )

            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    await uploadToS3(file, id)
                    return createUploadedFile(file, id)
                })
            )

            const fileIds = uploadedFiles.map((file) => file.id)

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
                const lesson = await findCourseFromLessonId(id)

                const { id: courseId } = lesson.Course

                const result = await getResultByCredentials(courseId, userId)

                if (!result) {
                    return res
                        .status(403)
                        .json({ message: 'You are not authorized to see this lesson' })
                }
            }

            const lesson = await getLessonWithFilesById(id)

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

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
                await removeFilesWithS3(lesson.Files)
                await createUploadedFilesWithS3(files, id)
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

        await removeLessonsWithRelations([lesson])

        res.json({ message: 'Lesson has been successfully removed' })
    } catch {
        res.status(400).json({ message: 'Cannot remove lesson' })
    }
})

export default router
