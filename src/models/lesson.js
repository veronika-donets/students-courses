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
        courseId: {
            type: Sequelize.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course id should not be empty',
                },
            },
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
        homeworkIds: {
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

export const createLesson = (courseId, title, description, uploadedFileIds) => {
    return Lesson.create({ courseId, title, description, uploadedFileIds })
}

export const updateLesson = (id, title, description, uploadedFileIds) => {
    return Lesson.update({ title, description, uploadedFileIds }, { where: { id } })
}

export const removeLesson = (id) => {
    return Lesson.destroy({ where: { id } })
}

export const addHomeworkIdToLesson = (id, homeworkId) => {
    return Lesson.update(
        {
            homeworkIds: sequelize.fn('array_append', sequelize.col('homeworkIds'), homeworkId),
        },
        { where: { id } }
    )
}

export const removeHomeworkIdFromLesson = (id, homeworkId) => {
    return Lesson.update(
        {
            homeworkIds: sequelize.fn('array_remove', sequelize.col('homeworkIds'), homeworkId),
        },
        { where: { id } }
    )
}
