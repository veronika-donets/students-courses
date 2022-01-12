import { hashPassword, USER_ROLES, VALIDATIONS } from '../helpers'

export const UserModel = (sequelize, DataTypes) =>
    sequelize.define(
        'Users',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: {
                        args: VALIDATIONS.FIRST_NAME,
                        msg: 'First name must be from 2 to 50 characters, special characters is not allowed',
                    },
                },
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: {
                        args: VALIDATIONS.LAST_NAME,
                        msg: 'Last name must be from 2 to 50 characters, special characters is not allowed',
                    },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: {
                        args: VALIDATIONS.EMAIL,
                        msg: 'Invalid email address',
                    },
                },
                unique: {
                    args: true,
                    msg: 'User with this email already exists',
                },
            },
            isEmailVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isPhoneVerified: {
              type: DataTypes.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: {
                        args: VALIDATIONS.PASSWORD,
                        msg: 'Password must be from 8 to 60 characters, at least one letter and one number',
                    },
                },
            },
            agreeTOS: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                validate: {
                    is: {
                        args: true,
                        msg: 'User must agree to the Terms of Service',
                    },
                },
            },
            role: {
                type: DataTypes.ENUM(...Object.values(USER_ROLES)),
                defaultValue: USER_ROLES.STUDENT,
            },
        },
        {
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
