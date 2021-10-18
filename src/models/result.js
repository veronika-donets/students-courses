import Sequelize from 'sequelize'
import { sequelize } from '../db/db'

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
