import Sequelize from 'sequelize'
import { USER_ROLES, VALIDATION_REGEX } from '../helpers'
import { sequelize } from '../db/db'
import { hashPassword } from '../services/user.service'

class UserModel extends Sequelize.Model {}

export const User = UserModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: VALIDATION_REGEX.FIRST_NAME,
                    msg: 'First name must be from 2 to 50 characters, special characters is not allowed',
                },
            },
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: VALIDATION_REGEX.LAST_NAME,
                    msg: 'Last name must be from 2 to 50 characters, special characters is not allowed',
                },
            },
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: VALIDATION_REGEX.EMAIL,
                    msg: 'Invalid email address',
                },
            },
            unique: {
                args: true,
                msg: 'User with this email already exists',
            },
        },
        isEmailVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: VALIDATION_REGEX.PASSWORD,
                    msg: 'Password must be from 8 to 60 characters, at least one letter and one number',
                },
            },
        },
        agreeTOS: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            validate: {
                is: {
                    args: true,
                    msg: 'User must agree to the Terms of Service',
                },
            },
        },
        role: {
            type: Sequelize.ENUM(...Object.values(USER_ROLES)),
            defaultValue: USER_ROLES.STUDENT,
        },
    },
    {
        modelName: 'Users',
        sequelize,
        hooks: {
            beforeValidate: (user) => {
                const { email } = user
                user.email = email ? email.toLowerCase() : ''
            },
            afterValidate: async (user) => {
                const { password } = user
                if (password) {
                    user.password = await hashPassword(password)
                }
            },
        },
    }
)
;(async () => {
    await sequelize.sync()
})()
