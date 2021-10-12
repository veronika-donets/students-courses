import passport from '../config/passport'
import { USER_ROLES } from '../helpers'
import router from './courses.routes'
import { getFileById, removeFile } from '../models/file'

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

router.delete('/:id', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id } = req.params
        const result = await removeFile(id)

        if (!result) {
            res.status(400).json({ message: 'Cannot delete file' })
        }

        res.json({ message: 'File successfully deleted' })
    } catch {
        res.status(400).json({ message: 'Cannot delete file' })
    }
})

export default router
