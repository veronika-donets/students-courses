import { sequelize } from '../db.js'
import Sequelize from 'sequelize'

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
            defaultValue: false
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

export const updateFeedback = (id, finalMark, isCoursePassed) => {
    return Result.update({ finalMark, isCoursePassed }, { where: { id } })
}

export const updateFinalMark = (id, ) => {
    return Result.findOne({ where: { id } })
}

export const getAllResultsByCredentials = (ids, studentId) => {
    return Result.findAll({ where: { courseId: ids, studentId } })
}

export const findAllPassedCoursesByStudentId = (studentId) => {
    return Result.findAll({ where: { studentId, isCoursePassed: true } })
}

export const findAllInProgressCoursesByStudentId = (ids, studentId) => {
    return Result.findAll({ where: { studentId, isCoursePassed: false } })
}
