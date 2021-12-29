import DataTypes from 'sequelize'

export const FileModel = (sequelize, DataTypes = DataTypes) =>
    sequelize.define('Files', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        originalname: {
            type: DataTypes.STRING,
        },
        sourceId: {
            type: DataTypes.UUID,
        },
        mimetype: {
            type: DataTypes.STRING,
        },
        size: {
            type: DataTypes.INTEGER,
        },
    })
