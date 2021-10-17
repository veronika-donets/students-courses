import { sequelize } from '../db/db.js'
import Sequelize from 'sequelize'
import { User } from './user'
import Lodash from 'lodash'
import { Homework } from './homework'

class ResultModel extends Sequelize.Model {}

export const Result = ResultModel.init(
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
        isCoursePassed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        finalMark: {
            type: Sequelize.STRING,
        },
        feedback: {
            type: Sequelize.STRING,
        },
    },
    {
        modelName: 'Results',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

export const createResult = async (courseId, studentId) => {
    return Result.create({ courseId, studentId })
}

export const getResultByCredentials = (courseId, studentId) => {
    return Result.findOne({ where: { courseId, studentId } })
}

export const getAllResultsByStudentId = (studentId) => {
    return Result.findAll({ where: { studentId } })
}

export const updateFeedback = (id, finalMark, isCoursePassed) => {
    return Result.update({ finalMark, isCoursePassed }, { where: { id } })
}

export const updateFinalMark = (id, finalMark, isCoursePassed) => {
    return Result.update({ finalMark, isCoursePassed }, { where: { id } })
}

export const getStudentsPerCourse = (courseId) => {
    return Result.findAll({
        where: { courseId },
        attributes: [],
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'firstName', 'lastName'],
                required: false,
            },
        ],
    })
}

export const removeResults = async (results) => {
    if (Lodash.isEmpty(results)) return

    const resultIds = results.map((el) => el.id)

    return Homework.destroy({ where: { id: resultIds } })
}
