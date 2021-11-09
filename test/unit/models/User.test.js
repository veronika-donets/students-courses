import { sequelize, dataTypes } from 'sequelize-test-helpers'
import { UserModel } from '../../../src/models'
import { expect } from '@jest/globals'

describe('User model testing', () => {
    const User = UserModel(sequelize, dataTypes)
    const user = new User()

    test('Check model name', () => {
        expect(User.modelName).toBe('Users')
    })

    describe('Check model properties', () => {
        const props = [
            'id',
            'firstName',
            'lastName',
            'email',
            'isEmailVerified',
            'password',
            'agreeTOS',
            'role',
        ]

        props.forEach((propName) => {
            test(`Check property '${propName}'`, () => {
                expect(user).toHaveProperty(propName)
            })
        })
    })
})
