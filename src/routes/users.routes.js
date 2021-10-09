import { Router } from 'express'
import {
    createUser,
    generateAuthToken,
    getUserByCredentials,
    getUserByEmail,
    getUserById,
    resetPassword,
    updateIsEmailVerified,
    updateUserRole,
} from '../models/user'
import { sendResetPassEmail, sendVerificationEmail } from '../services/email.service'
import jwt_decode from 'jwt-decode'
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

export default router
