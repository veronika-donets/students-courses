import { Router } from 'express'
import {
    createUser,
    generateAuthToken,
    getUserByCredentials,
    getUserByEmail,
    getUserById,
    removeUser,
    resetPassword,
    updateIsEmailVerified,
    updateUserRole,
} from '../models/user'
import { sendResetPassEmail, sendVerificationEmail } from '../services/email.service'
import jwt_decode from 'jwt-decode'
import passport from '../config/passport'
import { USER_ROLES } from '../helpers'

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
            role,
        }

        res.json({ user: newUser })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await getUserByCredentials(email, password)

        const token = await generateAuthToken(user)

        await res.json({
            token,
            id: user.id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        })
    } catch (e) {
        res.status(401).json({ message: 'Login failed. Please check email/password and try again' })
    }
})

router.post('/reset-password', async (req, res) => {
    try {
        const userEmail = req.body.email
        const email = userEmail ? userEmail.toLowerCase() : undefined

        const user = await getUserByEmail(email)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const token = await generateAuthToken(user)
        const response = await sendResetPassEmail(email, token)

        if (!response) {
            return res.status(400).json({ message: 'Reset password email has not been sent' })
        }

        res.status(200).json({ message: 'Reset password email has been sent' })
    } catch (e) {
        return res.status(403).json({ message: e })
    }
})

router.post('/set-password', async (req, res) => {
    try {
        const { key, password, token } = req.body
        const serverKey = process.env.AUTH_SECRET_KEY

        if (key !== serverKey) {
            return res.status(403).json({ message: "Secret keys don't match" })
        }

        if (!req.body.token) {
            return res.status(403).json({ message: 'User token is not provided' })
        }

        const { data } = jwt_decode(token)

        if (data) {
            const { id } = data

            const user = await resetPassword(id, password)

            if (!user) {
                return res.status(403).json({ message: 'Reset password failed' })
            }

            res.json({ message: 'Reset password success' })
        }
    } catch (e) {
        res.status(403).json({ message: 'Reset password failed' })
    }
})

router.post('/verify/email/send', async (req, res) => {
    try {
        const userEmail = req.body.email
        const email = userEmail ? userEmail.toLowerCase() : undefined

        const user = await getUserByEmail(email)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const token = await generateAuthToken(user)
        const response = await sendVerificationEmail(email, token)

        if (!response) {
            return res.status(400).json({ message: 'Verification email has not been sent' })
        }

        res.status(200).json({ message: 'Verification email has been sent' })
    } catch (e) {
        res.status(403).json({ message: 'Sending email verification failed' })
    }
})

router.post('/verify/email/confirm', async (req, res) => {
    try {
        const { key, token } = req.body
        const serverKey = process.env.AUTH_SECRET_KEY

        if (key !== serverKey) {
            return res.status(403).json({ message: "Secret keys don't match" })
        }

        if (!req.body.token) {
            return res.status(403).json({ message: 'User token is not provided' })
        }

        const { data } = jwt_decode(token)

        if (data) {
            const { id } = data

            const { email, isEmailVerified, role } = await getUserById(id)

            if (isEmailVerified) {
                return res.status(400).json({ message: 'Email is already verified' })
            }

            // Update user role to admin
            if (email === process.env.COURSES_ADMIN_EMAIL && role !== USER_ROLES.ADMIN) {
                await updateUserRole(id, USER_ROLES.ADMIN)
            }

            const user = await updateIsEmailVerified(id, true)

            if (!user) {
                return res.status(403).json({ message: 'Email verification failed' })
            }

            res.json({ message: 'Email verification success' })
        }
    } catch (e) {
        res.status(403).json({ message: 'Email verification failed' })
    }
})

router.put('/role', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id, role } = req.body

        if (!id || !role) {
            return res.status(400).json({ message: 'User id or role is not provided' })
        }

        const user = await getUserById(id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const result = await updateUserRole(id, role)

        if (!result) {
            return res.status(400).json({ message: 'Update user role failed' })
        }

        res.json({ message: 'Update user role success' })
    } catch (e) {
        res.status(400).json({ message: 'Update user role failed' })
    }
})

router.delete('/remove', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'User email is not provided' })
        }

        const user = await getUserByEmail(email)

        if (user.role === USER_ROLES.ADMIN) {
            return res.status(400).json({ message: 'Admin user cannot be removed' })
        }

        const result = await removeUser(email)

        if (!result) {
            return res.status(400).json({ message: 'Cannot remove user' })
        }

        res.json({ message: 'User removed' })
    } catch (e) {
        res.status(400).json({ message: 'Cannot remove user' })
    }
})

export default router
