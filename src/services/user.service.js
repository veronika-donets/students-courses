import { USER_ROLES } from '../helpers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import jwt_decode from 'jwt-decode'
import { removeResults } from './result.service'
import { removeHomeworksWithContains } from './homework.service'
import { File } from '../models/file'
import Lodash from 'lodash'
import { User } from '../models/user'
import { Result } from '../models/result'
import { Course } from '../models/course'
import { Homework } from '../models/homework'
import { Lesson } from '../models/lesson'

export const getUserByEmail = (userEmail) => {
    const email = userEmail ? userEmail.toLowerCase() : ''
    return User.findOne({ where: { email } })
}

export const getUserByEmailWithContains = (userEmail) => {
    const email = userEmail ? userEmail.toLowerCase() : ''
    return User.findOne({
        where: { email },
        attributes: ['id', 'role'],
        include: [
            {
                model: Result,
                attributes: ['id'],
                required: false,
            },
            {
                model: Homework,
                attributes: ['id'],
                required: false,
                include: [
                    {
                        model: File,
                        attributes: ['id'],
                        required: false,
                    },
                ],
            },
        ],
    })
}

export const getUserById = (id) => {
    return User.findOne({ where: { id } })
}

export const findLessonInProgressCourses = (studentId, lessonId) => {
    return Result.findAll({
        where: { studentId, isCoursePassed: false },
        include: [
            {
                model: Course,
                attributes: ['id'],
                required: false,
                include: [
                    {
                        model: Lesson,
                        attributes: ['id'],
                        where: { id: lessonId },
                        required: false,
                    },
                ],
            },
        ],
    })
}

export const getUserByCredentials = async (email, password) => {
    const emailLowerCased = email ? email.toLowerCase() : undefined
    const user = await getUserByEmail(emailLowerCased)

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Passwords not match')
    }

    return user
}

export const generateAuthToken = async (user) => {
    return jwt.sign(
        { data: { id: user.id } },
        process.env.AUTH_SECRET_KEY,
        { expiresIn: 604800 } // 1 week
    )
}

export const getUserIdFromToken = async (token) => {
    const { data } = jwt_decode(token)
    return data && data.id ? data.id : null
}

export const createUser = async ({ firstName, lastName, email, password, agreeTOS }) => {
    return User.create({ firstName, lastName, email, password, agreeTOS })
}

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(6)

    if (!salt) {
        throw new Error('Cannot encrypt a password')
    }

    const hash = await bcrypt.hash(password, salt)

    if (!hash) {
        throw new Error('Cannot generate hash')
    }

    return hash
}

export const updatePassword = (id, password) => {
    return User.update({ password }, { where: { id } })
}

export const updateIsEmailVerified = (id, isEmailVerified) => {
    return User.update({ isEmailVerified }, { where: { id } })
}

export const updateUserRole = (id, newRole) => {
    const role = newRole ? newRole.toUpperCase() : ''
    const isRoleExists = Object.values(USER_ROLES).some((el) => el === role)
    if (isRoleExists) {
        return User.update({ role }, { where: { id } })
    }
    return null
}

export const removeUserWithRelations = async (user) => {
    const { id, Results, Homeworks } = user

    if (!Lodash.isEmpty(Homeworks)) {
        await removeHomeworksWithContains(Homeworks)
    }

    if (!Lodash.isEmpty(Results)) {
        await removeResults(Results)
    }

    return User.destroy({ where: { id } })
}