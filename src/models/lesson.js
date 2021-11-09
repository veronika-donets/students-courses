import DataTypes from 'sequelize'

export const LessonModel = (sequelize, DataTypes = DataTypes) =>
    sequelize.define('Lessons', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course id should not be empty',
                },
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Lesson title should not be empty',
                },
            },
        },
        description: {
            type: DataTypes.STRING,
        },
    })
