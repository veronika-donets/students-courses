import DataTypes from 'sequelize'

export const ResultModel = (sequelize, DataTypes = DataTypes) =>
    sequelize.define('Results', {
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
        isCoursePassed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        finalMark: {
            type: DataTypes.STRING,
        },
        feedback: {
            type: DataTypes.STRING,
        },
    })
