import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import { Router } from 'express'
import { downloadFromS3 } from '../services/aws-S3.service'
import Lodash from 'lodash'
import { getFileByIdWithSource } from '../services/file.service'

const router = Router()

router.get(
    '/:id',
    passport.authenticate([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]),
    async (req, res) => {
        try {
            const { id } = req.params

            const { originalname, sourceId, Homework, Lesson } = await getFileByIdWithSource(id)

            if (!Homework && Lodash.isEmpty(Lesson.Course.Results)) {
                return res.status(403).json({ message: 'You are not authorized to see this file' })
            }

            const file = await downloadFromS3(originalname, sourceId)

            res.end(file.Body, 'binary')
        } catch (e) {
            res.status(404).json({ message: e.message + ' File not found' })
        }
    }
)

export default router
