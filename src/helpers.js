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

export const VALIDATIONS = Object.freeze({
    FIRST_NAME: /^[-,a-z. ']{2,50}$/i,
    LAST_NAME: /^[-,a-z. ']{2,50}$/i,
    EMAIL: /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
    PASSWORD: /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,60}$/i,
    MARK: /^[0-9]$|^[1-9][0-9]$|^(100)$/,
    FILE_TYPE: [
        'image/jpeg',
        'application/pdf',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.text',
        'application/rtf',
        'text/plain',
    ],
})

export const checkUnsupportedFormat = (files) => {
    const unsupportedFormat = files.find((file) => !VALIDATIONS.FILE_TYPE.includes(file.mimetype))
    return Boolean(unsupportedFormat)
}

export const getAwsFilePath = (sourceId, originalName) => {
    const fileName = originalName.replace(/\s+/g, '-')

    return `${sourceId}/${fileName}`
}
