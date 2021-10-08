import dotenv from 'dotenv'
dotenv.config()

export function getEnvVar(variable) {
    return process.env[`${variable}_${process.env.NODE_ENV}`] || ''
}

export const USER_ROLES = Object.freeze({
    ADMIN: 'ADMIN',
    INSTRUCTOR: 'INSTRUCTOR',
    STUDENT: 'STUDENT',
})

export const VALIDATION_REGEX = Object.freeze({
    FIRST_NAME: /^[-,a-z. ']{2,50}$/i,
    LAST_NAME: /^[-,a-z. ']{2,50}$/i,
    EMAIL: /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
    PASSWORD: /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,60}$/i,
})
