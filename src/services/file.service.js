import fs from 'fs'
import path from 'path'
import { File } from '../models/file'

export const getFileById = (id) => {
    return File.findOne({ where: { id } })
}

export const createUploadedFile = (sourceId, { originalname, mimetype, filename, path, size }) => {
    const data = fs.readFileSync(path)

    return File.create({
        sourceId,
        originalname,
        mimetype,
        filename,
        data,
        size,
    })
}

export const removeFiles = (ids) => {
    return File.destroy({ where: { id: [...ids] } })
}

export const cleanUploadsFolder = (files) => {
    return files.forEach(async (file) => {
        fs.unlinkSync(path.resolve(file.path))
    })
}
