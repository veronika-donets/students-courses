import DataTypes from 'sequelize'

export const CourseModel = (sequelize, DataTypes = DataTypes) =>
    sequelize.define('Courses', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        title: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course description should not be empty',
                },
            },
        },
        instructorIds: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
        },
    })
