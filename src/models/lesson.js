import Sequelize from 'sequelize'
import { sequelize } from '../db/db.js'

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
        },
        description: {
            type: Sequelize.STRING,
        },
    },
    {
        modelName: 'Lessons',
        sequelize,
    }
)
