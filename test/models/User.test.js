import dataTypes from 'sequelize'
import { UserModel } from '../../src/models'
import { expect } from '@jest/globals'
import { mockSequelize } from '../__mock__/mockSequelize'

describe('User model testing', () => {
    const User = UserModel(mockSequelize, dataTypes)
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

    test('Check hooks', () => {
        expect(User).toHaveProperty('beforeValidate')
        expect(User).toHaveProperty('afterValidate')
    })
})
