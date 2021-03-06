import { Router } from 'express'
import {
    createUser,
    generateAuthToken,
    getUserByCredentials,
    getUserByEmail,
    getUserByEmailWithRelations,
    getUserById,
    getUserIdFromToken,
    removeUserWithRelations,
    updateIsEmailVerified,
    updatePassword,
    updateUserRole,
} from '../services/user.service'
import { sendResetPassEmail, sendVerificationEmail } from '../services/email.service'
import jwt_decode from 'jwt-decode'
import passport from '../auth'
import { USER_ROLES } from '../helpers'
import {
    findCoursesByInstructorId,
    unassignInstructorFromAllCourses,
} from '../services/course.service'

const router = Router()

router.post('/register', async (req, res) => {
    try {
        const { id, firstName, lastName, email, isEmailVerified, role } = await createUser(req.body)

        const user = {
            firstName,
            lastName,
            email,
            isEmailVerified,
            role,
        }

        // Send email verification
        const token = await generateAuthToken({ id })
        await sendVerificationEmail(email, token)

        res.json({
            user: {
                token,
                ...user,
            },
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email: userEmail, password } = req.body
        const { id, email, isEmailVerified, firstName, lastName, role } =
            await getUserByCredentials(userEmail, password)

        const token = await generateAuthToken({ id })

        res.json({
            user: {
                token,
                email,
                isEmailVerified,
                firstName,
                lastName,
                role,
            },
        })
    } catch {
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

        const token = await generateAuthToken({ id: user.id })
        const response = await sendResetPassEmail(email, token)

        if (!response) {
            return res.status(400).json({ message: 'Reset password email has not been sent' })
        }

        res.status(200).json({ message: 'Reset password email has been sent' })
    } catch {
        return res.status(500).json({ message: 'Reset password failed' })
    }
})

router.post('/set-password', async (req, res) => {
    try {
        const { password, token } = req.body

        if (!req.body.token) {
            return res.status(404).json({ message: 'User token is not provided' })
        }

        if (!req.body.password) {
            return res.status(404).json({ message: 'New password is not provided' })
        }

        const decoded = jwt_decode(token)
        const { id } = decoded.data
        const user = await getUserById(id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        await updatePassword(id, password)

        res.json({ message: 'Update password success' })
    } catch (e) {
        res.status(500).json({ message: 'Update password failed' })
    }
})

router.post('/verify/email/send', async (req, res) => {
    try {
        const email = req.body.email

        if (!email || typeof email !== 'string') {
            return res.status(404).json({ message: 'Email is invalid or not provided' })
        }

        const user = await getUserByEmail(email.toLowerCase())

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const token = await generateAuthToken({ id: user.id })
        const response = await sendVerificationEmail(email, token)

        if (!response) {
            return res.status(400).json({ message: 'Verification email has not been sent' })
        }

        res.status(200).json({ message: 'Verification email has been sent' })
    } catch (e) {
        res.status(500).json({ message: 'Sending email verification failed' })
    }
})

router.post('/verify/email/confirm', async (req, res) => {
    try {
        const { token } = req.body

        if (!req.body.token) {
            return res.status(403).json({ message: 'User token is not provided' })
        }

        const id = await getUserIdFromToken(token)

        if (!id) {
            return res.status(404).json({ message: 'User not found' })
        }

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
            return res.status(400).json({ message: 'Email verification failed' })
        }

        res.json({ message: 'Email verification success' })
    } catch (e) {
        res.status(500).json({ message: 'Email verification failed' })
    }
})

router.put('/role', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id, role } = req.body
        const { jwt } = req.headers
        const userId = await getUserIdFromToken(jwt)

        if (!id || !role) {
            return res.status(404).json({ message: 'User id or role is not provided' })
        }

        const user = await getUserById(id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user.id === userId) {
            return res.status(400).json({ message: 'User cannot update own role' })
        }

        await updateUserRole(id, role)

        res.json({ message: 'Update user role success' })
    } catch (e) {
        res.status(500).json({ message: 'Update user role failed' })
    }
})

router.post('/token', async (req, res) => {
    try {
        const email = req.body.email

        if (!email || typeof email !== 'string') {
            return res.status(404).json({ message: 'Email is invalid or not provided' })
        }

        const user = await getUserByEmail(email.toLowerCase())

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const token = await generateAuthToken({ id: user.id })

        res.status(200).json({ token })
    } catch (e) {
        res.status(500).json({ message: 'Cannot generate token' })
    }
})

router.delete('/', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { email } = req.query

        if (!email) {
            return res.status(404).json({ message: 'User email is not provided' })
        }

        const user = await getUserByEmailWithRelations(email)

        const { id, role } = user

        if (role === USER_ROLES.ADMIN) {
            return res.status(400).json({ message: 'Admin user cannot be removed' })
        }

        if (role === USER_ROLES.INSTRUCTOR) {
            const courses = await findCoursesByInstructorId(id)
            const courseIds = courses.map((el) => el.id)

            await unassignInstructorFromAllCourses(courseIds, id)
        }

        await removeUserWithRelations(user)

        res.json({ message: 'User has been successfully removed' })
    } catch (e) {
        res.status(500).json({ message: 'Cannot remove user' })
    }
})

router.get(
    '/me',
    passport.authenticate([USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { jwt } = req.headers

            const userId = await getUserIdFromToken(jwt)
            const user = await getUserById(userId)

            const { firstName, lastName, email, isEmailVerified, role } = user

            res.json({
                user: {
                    firstName,
                    lastName,
                    email,
                    isEmailVerified,
                    role,
                },
            })
        } catch {
            res.status(500).json({ message: 'Cannot get user' })
        }
    }
)

router.get('/', passport.authenticate([USER_ROLES.ADMIN]), async (req, res) => {
    try {
        const { id: userId } = req.query

        const user = await getUserById(userId)

        const { id, firstName, lastName, email, isEmailVerified, role } = user

        res.json({
            user: {
                id,
                firstName,
                lastName,
                email,
                isEmailVerified,
                role,
            },
        })
    } catch {
        res.status(500).json({ message: 'Cannot get user' })
    }
})

export default router
