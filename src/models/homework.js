import { sequelize } from '../db/db.js'
import Sequelize from 'sequelize'
import { VALIDATION_REGEX } from '../helpers'
import Lodash from 'lodash'
import { File, removeFiles } from './file'
import { Lesson } from './lesson'

class HomeworkModel extends Sequelize.Model {}

export const Homework = HomeworkModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        lessonId: {
            type: Sequelize.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Lesson id should not be empty',
                },
            },
        },
        studentId: {
            type: Sequelize.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Student id should not be empty',
                },
            },
        },
        comment: {
            type: Sequelize.STRING,
        },
        mark: {
            type: Sequelize.INTEGER,
            validate: {
                is: {
                    args: VALIDATION_REGEX.MARK,
                    msg: 'Mark must be from 0 to 100',
                },
            },
        },
    },
    {
        modelName: 'Homeworks',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

export const getHomeworkWithFilesById = (id) => {
    return Homework.findOne({
        where: { id },
        attributes: ['id', 'lessonId', 'studentId', 'comment', 'mark'],
        include: [
            {
                model: File,
                attributes: ['id'],
                required: false,
            },
        ],
    })
}

export const getHomeworkWithLessonById = (id) => {
    return Homework.findOne({
        where: { id },
        attributes: ['id', 'lessonId', 'studentId', 'comment', 'mark'],
        include: [
            {
                model: Lesson,
                attributes: ['courseId'],
                required: false,
            },
        ],
    })
}

export const getAllHomeworksPerCourse = (lessonIds, studentId) => {
    return Homework.findAll({
        where: { lessonId: lessonIds, studentId },
        attributes: ['id', 'lessonId', 'studentId', 'comment', 'mark'],
    })
}

export const createHomework = (lessonId, studentId, comment) => {
    return Homework.create({ lessonId, studentId, comment })
}

export const updateHomework = (id, comment) => {
    return Homework.update({ comment }, { where: { id } })
}

export const putMark = (id, mark) => {
    return Homework.update({ mark }, { where: { id } })
}

export const removeHomework = (id) => {
    return Homework.destroy({ where: { id } })
}

export const removeHomeworksWithContains = async (homeworks) => {
    if (Lodash.isEmpty(homeworks)) return

    const homeworkIds = homeworks.map((el) => el.id)
    const homeworkFileIds = homeworks.map((el) => el.Files.map((file) => file.id)).flat(1)

    await removeFiles(homeworkFileIds)

    return Homework.destroy({ where: { id: homeworkIds } })
}
