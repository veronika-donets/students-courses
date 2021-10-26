import Sequelize from 'sequelize'
import { sequelize } from '../db/db.js'
import { VALIDATIONS } from '../helpers'

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
                    args: VALIDATIONS.MARK,
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
