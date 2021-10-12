import { sequelize } from '../db.js'
import Sequelize from 'sequelize'

class LessonModel extends Sequelize.Model {}

export const Lesson = LessonModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Lesson title should not be empty',
                },
            },
            unique: {
                args: true,
                msg: 'Lesson with the same title already exists',
            },
        },
        description: {
            type: Sequelize.STRING,
        },
        uploadedFileIds: {
            type: Sequelize.ARRAY(Sequelize.UUID),
            defaultValue: [],
        },
    },
    {
        modelName: 'Lessons',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

export const getLessonById = (id) => {
    return Lesson.findOne({ where: { id } })
}

export const getLessonByTitle = (title) => {
    return Lesson.findOne({ where: { title } })
}

export const createLesson = (title, description, uploadedFileIds) => {
    return Lesson.create({ title, description, uploadedFileIds })
}
