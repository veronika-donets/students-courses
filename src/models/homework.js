import DataTypes from 'sequelize'
import { VALIDATIONS } from '../helpers'

export const HomeworkModel = (sequelize, DataTypes = DataTypes) =>
    sequelize.define('Homeworks', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        lessonId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Lesson id should not be empty',
                },
            },
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Student id should not be empty',
                },
            },
        },
        comment: {
            type: DataTypes.STRING,
        },
        mark: {
            type: DataTypes.INTEGER,
            validate: {
                is: {
                    args: VALIDATIONS.MARK,
                    msg: 'Mark must be from 0 to 100',
                },
            },
        },
    })
