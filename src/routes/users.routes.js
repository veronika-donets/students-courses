import { Router } from 'express'
import { createUser } from '../models/user'

const router = Router()

router.post('/register', async (req, res) => {
    try {
        const { id, firstName, lastName, email, isEmailVerified, role } = await createUser(req.body)

        const newUser = {
            id,
            firstName,
            lastName,
            email,
            isEmailVerified,
            role
        }

        res.status(200)
        res.json({ user: newUser })
    } catch (e) {
        console.log('e', e)
        res.status(400)
        res.json({ message: e.message })
    }
})

export default router
