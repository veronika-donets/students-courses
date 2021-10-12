import { Router } from 'express'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import { createLesson, getLessonByTitle } from '../models/lesson'
import multer from 'multer'
import { cleanUploadsFolder, createUploadedFile } from '../models/file'

const router = Router()
const upload = multer({ dest: 'uploads/' })

router.post(
    '/create',
    passport.authenticate([USER_ROLES.ADMIN]),
    upload.array('file', 10),
    async (req, res) => {
        // The endpoint supports to upload maximum 10 files

        try {
            const { title: lessonTitle, description: lessonDescription } = req.body
            const { files } = req

            const existingLesson = await getLessonByTitle(lessonTitle)

            if (existingLesson) {
                return res
                    .status(400)
                    .json({ message: 'Lesson with the same title already exists' })
            }

            const createdFiles = await Promise.all(files.map((file) => createUploadedFile(file)))

            const fileIds = createdFiles.map((file) => file.id)

            const { id, title, description, uploadedFileIds } = await createLesson(
                lessonTitle,
                lessonDescription,
                fileIds
            )

            res.json({ id, title, description, uploadedFileIds })
        } catch (e) {
            res.status(400).json({ message: e.message })
        } finally {
            await cleanUploadsFolder(req.files)
        }
    }
)

export default router
