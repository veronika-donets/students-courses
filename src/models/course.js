import Sequelize from 'sequelize'
import { sequelize } from '../db/db'

class CourseModel extends Sequelize.Model {}

export const Course = CourseModel.init(
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
                    msg: 'Course title should not be empty',
                },
            },
            unique: {
                args: true,
                msg: 'Course with the same title already exists',
            },
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course description should not be empty',
                },
            },
        },
        instructorIds: {
            type: Sequelize.ARRAY(Sequelize.UUID),
            defaultValue: [],
        },
    },
    {
        modelName: 'Courses',
        sequelize,
    }
)
