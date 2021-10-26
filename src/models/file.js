import Sequelize from 'sequelize'
import { sequelize } from '../db/db'

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
        size: {
            type: Sequelize.INTEGER,
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
