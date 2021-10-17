import { sequelize } from '../db/db.js'
import Sequelize from 'sequelize'
import fs from 'fs'
import path from 'path'

class FilesModel extends Sequelize.Model {}

export const File = FilesModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        originalname: {
            type: Sequelize.STRING,
        },
        sourceId: {
            type: Sequelize.UUID,
        },
        mimetype: {
            type: Sequelize.STRING,
        },
        filename: {
            type: Sequelize.STRING,
        },
        size: {
            type: Sequelize.INTEGER,
        },
        data: {
            type: Sequelize.BLOB,
            allowNull: false,
        },
    },
    {
        modelName: 'Files',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

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
