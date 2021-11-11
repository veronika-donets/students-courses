import request from 'supertest'
import { jest } from '@jest/globals'
import { createMockApp, mockSendGrid } from '../__mock__/mockApp'
import users from '../../../src/routes/users.routes'
import { mockUser } from '../__mock__/mockUser'
import faker from 'faker'
import { User } from '../../../index'

describe('User routes testing', () => {
    let app
    const spyUserCreate = jest.spyOn(User, 'create')
    const spyUserFindOne = jest.spyOn(User, 'findOne')

    beforeAll(() => {
        app = createMockApp()
        app.use('/users', users)
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockSendGrid()
    })

    test('Register user', async () => {
        const testUser = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            agreeTOS: faker.datatype.boolean(),
        }

        const response = await request(app).post('/users/register').send(testUser)
        const { user } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserCreate).toBeCalledTimes(1)
        expect(user.firstName).toBe(testUser.firstName)
        expect(user.lastName).toBe(testUser.lastName)
        expect(user.email).toBe(testUser.email)
        expect(user.token).toBeDefined()
    })

    test('Login user success', async () => {
        const testUser = {
            email: faker.internet.email(),
            password: mockUser.decryptedPassword,
        }
        const response = await request(app).post('/users/login').send(testUser)

        const { user } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserFindOne).toBeCalledTimes(1)
        expect(user.email).toBe(testUser.email.toLowerCase())
        expect(user.firstName).toBe(mockUser.firstName)
        expect(user.lastName).toBe(mockUser.lastName)
        expect(user.isEmailVerified).toBe(mockUser.isEmailVerified)
        expect(user.role).toBe(mockUser.role)
        expect(user.token).toBeDefined()
    })

    test('Login user should return 401 if password not match', async () => {
        const testUser = {
            email: faker.internet.email(),
            password: faker.internet.password(),
        }
        const response = await request(app).post('/users/login').send(testUser)

        const error = JSON.parse(response.error.text)

        expect(spyUserFindOne).toBeCalledTimes(1)
        expect(response.statusCode).toBe(401)
        expect(error.message).toBe('Login failed. Please check email/password and try again')
    })

    test('Reset password success', async () => {
        const testUser = {
            email: faker.internet.email(),
        }
        const response = await request(app).post('/users/reset-password').send(testUser)
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserFindOne).toBeCalledTimes(1)
        expect(message).toBe('Reset password email has been sent')
    })
})
