import passport from '../auth'
import { USER_ROLES } from '../helpers'
import { Router } from 'express'
import { downloadFromS3 } from '../services/aws-S3.service'
import Lodash from 'lodash'
import { getFileByIdWithSource } from '../services/file.service'
import { getUserById, getUserIdFromToken } from '../services/user.service'

const router = Router()

router.get(
    '/:id',
    passport.authenticate([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]),
    async (req, res) => {
        try {
            const { id } = req.params
            const { jwt } = req.headers

            let isAdmin = false

            if (jwt) {
                const id = await getUserIdFromToken(jwt)
                const { role } = await getUserById(id)
                if (role === USER_ROLES.ADMIN) {
                    isAdmin = true
                }
            }

            const result = await getFileByIdWithSource(id)

            if (!result) {
                return res.status(404).json({ message: 'File not found' })
            }

            const { originalname, sourceId, Homework, Lesson } = result

            if (!Homework && Lodash.isEmpty(Lesson.Course.Results) && !isAdmin) {
                return res.status(403).json({ message: 'You are not authorized to see this file' })
            }

            const file = await downloadFromS3(originalname, sourceId)

            res.end(file.Body, 'binary')
        } catch {
            res.status(500).json({ message: 'Cannot get file' })
        }
    }
)

export default router
