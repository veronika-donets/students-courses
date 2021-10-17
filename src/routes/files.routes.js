import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import { getFileById } from '../models/file'
import { Router } from 'express'

const router = Router()

router.get(
    '/:id',
    passport.authenticate([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]),
    async (req, res) => {
        try {
            const { id } = req.params
            const { data } = await getFileById(id)

            res.end(data, 'binary')
        } catch {
            res.status(404).json({ message: 'File not found' })
        }
    }
)

export default router
