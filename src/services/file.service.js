import fs from 'fs'
import path from 'path'
import { removeFilesFromS3, uploadToS3 } from './aws-S3.service'
import Lodash from 'lodash'
import { Course, Homework, Lesson, Result, File } from '../../index'

export const getFileById = (id) => {
    return File.findOne({ where: { id } })
}

export const getFileByIdWithSource = (id) => {
    return File.findOne({
        where: { id },
        include: [
            {
                model: Homework,
                attributes: ['id', 'studentId'],
                required: false,
            },
            {
                model: Lesson,
                attributes: ['id', 'courseId'],
                required: false,
                include: [
                    {
                        model: Course,
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: Result,
                                attributes: ['id', 'studentId'],
                            },
                        ],
                    },
                ],
            },
        ],
    })
}

export const createUploadedFile = ({ originalname, mimetype, size }, sourceId) => {
    return File.create({
        originalname,
        mimetype,
        size,
        sourceId,
    })
}

export const createUploadedFilesWithS3 = (files, sourceId) => {
    if (Lodash.isEmpty(files)) return

    return Promise.all(
        files.map(async (file) => {
            await uploadToS3(file, sourceId)
            return createUploadedFile(file, sourceId)
        })
    )
}

export const removeFiles = (ids) => {
    if (Lodash.isEmpty(ids)) return

    return File.destroy({ where: { id: [...ids] } })
}

export const removeFilesWithS3 = async (files) => {
    if (Lodash.isEmpty(files)) return

    const ids = files.map((file) => file.id)
    await File.destroy({ where: { id: [...ids] } })
    return removeFilesFromS3(files)
}

export const cleanUploadsFolder = (files) => {
    if (Lodash.isEmpty(files)) return

    return files.forEach((file) => {
        fs.unlinkSync(path.resolve(file.path))
    })
}
