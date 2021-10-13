import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import {
    createLesson,
    getLessonById,
    getLessonByTitle,
    removeLesson,
    updateLesson,
} from '../models/lesson'
import multer from 'multer'
import { cleanUploadsFolder, createUploadedFile } from '../models/file'
import { addLessonIdToCourse, getCourseById, removeLessonIdFromCourse } from '../models/course'
import { removeHomeworkWithFiles } from '../models/homework'
import Lodash from 'lodash'

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

            const existingLesson = await getLessonByTitle(lessonTitle)

            if (existingLesson) {
                return res
                    .status(400)
                    .json({ message: 'Lesson with the same title already exists' })
            }

            const createdFiles = await Promise.all(files.map((file) => createUploadedFile(file)))

            const fileIds = createdFiles.map((file) => file.id)

            const course = await getCourseById(identifier)

            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const { id, courseId, title, description, uploadedFileIds } = await createLesson(
                identifier,
                lessonTitle,
                lessonDescription,
                fileIds
            )

            await addLessonIdToCourse(courseId, id)

            res.json({ id, courseId, title, description, uploadedFileIds })
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.post(
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

            const lesson = await getLessonById(id)

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

            const createdFiles = await Promise.all(files.map((file) => createUploadedFile(file)))

            const fileIds = createdFiles.map((file) => file.id)

            await updateLesson(id, title, description, fileIds)

            res.json({ message: 'Lesson successfully updated' })
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

router.delete('/:id', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: 'Lesson id is not provided' })
        }

        const lesson = await getLessonById(id)

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' })
        }

        const { homeworkIds, courseId } = lesson

        if (!Lodash.isEmpty(homeworkIds)) {
            await Promise.all(homeworkIds.map((id) => removeHomeworkWithFiles(id)))
        }

        const { lessonsIds } = await getCourseById(courseId)
        await Promise.all(lessonsIds.map((id) => removeLessonIdFromCourse(id)))

        await removeLesson(id)

        res.json({
            message: 'Lesson has been removed',
        })
    } catch {
        res.status(400).json({ message: 'Cannot remove homework' })
    }
})

export default router
