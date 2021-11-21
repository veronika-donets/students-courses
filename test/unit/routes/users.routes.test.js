import request from 'supertest'
import { jest } from '@jest/globals'
import { createMockApp, mockSendGrid } from '../__mock__/mockApp'
import users from '../../../src/routes/users.routes'
import faker from 'faker'
import { User } from '../../../index'
import { generateAuthToken } from '../../../src/services/user.service'
import { USER_ROLES } from '../../../src/helpers'
import { generateMockToken } from '../__mock__/mockAuthToken'
import { mockInstructorEmail, mockInstructorId, mockUser } from '../__mock__/mockResponseData'
import passport from '../../../src/auth'

describe('User routes testing', () => {
    let app
    let adminToken
    let instructorToken
    let studentToken

    const spyUserCreate = jest.spyOn(User, 'create')
    const spyUserUpdate = jest.spyOn(User, 'update')
    const spyUserFindOne = jest.spyOn(User, 'findOne')
    const spyUserDelete = jest.spyOn(User, 'destroy')

    beforeAll(async () => {
        app = createMockApp()
        app.use(passport.initialize())
        app.use('/users', users)

        adminToken = await generateMockToken({ role: USER_ROLES.ADMIN })
        instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR }, mockInstructorId)
        studentToken = await generateMockToken({ role: USER_ROLES.STUDENT })
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

    test('Reset password returns 500', async () => {
        const response = await request(app).post('/users/reset-password').send({})

        expect(response.statusCode).toBe(500)
        expect(spyUserFindOne).toBeCalledTimes(1)
    })

    test('Set password success', async () => {
        const token = await generateAuthToken({ id: faker.datatype.uuid() })
        const body = {
            password: faker.internet.password(),
            token,
        }
        const response = await request(app).post('/users/set-password').send(body)
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserUpdate).toBeCalledTimes(1)
        expect(message).toBe('Update password success')
    })

    test('Set password returns 404', async () => {
        const response = await request(app).post('/users/set-password').send({})

        expect(response.statusCode).toBe(404)
    })

    test('Set password returns 500', async () => {
        const body = {
            password: faker.internet.password(),
            token: '12345',
        }
        const response = await request(app).post('/users/set-password').send(body)

        expect(response.statusCode).toBe(500)
    })

    test('Verification email send success', async () => {
        const body = {
            email: faker.internet.email(),
        }
        const response = await request(app).post('/users/verify/email/send').send(body)
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(message).toBe('Verification email has been sent')
    })

    test('Set password returns 404', async () => {
        const invalidBody = { email: {} }
        const response = await request(app).post('/users/verify/email/send').send(invalidBody)

        expect(response.statusCode).toBe(404)
    })

    test('Verification email send success', async () => {
        const token = await generateAuthToken({ id: faker.datatype.uuid() })
        const body = { token }
        const response = await request(app).post('/users/verify/email/confirm').send(body)
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserUpdate).toBeCalledTimes(1)
        expect(message).toBe('Email verification success')
    })

    test('Verification email send returns 500', async () => {
        const invalidBody = { token: {} }
        const response = await request(app).post('/users/verify/email/confirm').send(invalidBody)

        expect(response.statusCode).toBe(500)
    })

    test('Update user role', async () => {
        const body = {
            id: faker.datatype.uuid(),
            role: USER_ROLES.INSTRUCTOR,
        }
        const response = await request(app).put('/users/role').send(body).set({ jwt: adminToken })
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserUpdate).toBeCalledTimes(1)
        expect(message).toBe('Update user role success')
    })

    test('Update user role returns 401 if sender is not admin', async () => {
        const body = {
            id: faker.datatype.uuid(),
            role: USER_ROLES.INSTRUCTOR,
        }
        const response = await request(app)
            .put('/users/role')
            .send(body)
            .set({ jwt: instructorToken })

        expect(response.statusCode).toBe(401)
    })

    test('Update user role returns 401 if send empty body', async () => {
        const response = await request(app)
            .put('/users/role')
            .send({})
            .set({ jwt: instructorToken })

        expect(response.statusCode).toBe(401)
    })

    test('Generate token success', async () => {
        const body = {
            email: faker.internet.email(),
        }
        const response = await request(app).post('/users/token').send(body)
        const { token } = response.body

        expect(response.statusCode).toBe(200)
        expect(token).toBeDefined()
    })

    test('Update user role returns 404 if send empty body', async () => {
        const response = await request(app).post('/users/token').send({})

        expect(response.statusCode).toBe(404)
    })

    test('Delete user success', async () => {
        const params = {
            email: mockInstructorEmail,
        }
        const response = await request(app).delete('/users/').query(params).set({ jwt: adminToken })
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyUserDelete).toBeCalledTimes(1)
        expect(message).toBe('User has been successfully removed')
    })

    test('Delete user returns 404 if send empty body', async () => {
        const response = await request(app).delete('/users/').query({}).set({ jwt: adminToken })

        expect(response.statusCode).toBe(404)
    })

    test('Get user success', async () => {
        const body = {
            email: faker.internet.email(),
        }
        const response = await request(app).get('/users/me').send(body).set({ jwt: studentToken })
        const { user } = response.body

        expect(response.statusCode).toBe(200)
        expect(user).toBeDefined()
        expect(user.firstName).toBeDefined()
        expect(user.lastName).toBeDefined()
        expect(user.email).toBeDefined()
        expect(user.isEmailVerified).toBeDefined()
        expect(user.role).toBeDefined()
    })

    test('Get user by id success', async () => {
        const param = {
            id: faker.datatype.uuid(),
        }
        const response = await request(app).get('/users/').query(param).set({ jwt: adminToken })
        const { user } = response.body

        expect(response.statusCode).toBe(200)
        expect(user).toBeDefined()
        expect(user.firstName).toBeDefined()
        expect(user.lastName).toBeDefined()
        expect(user.email).toBeDefined()
        expect(user.isEmailVerified).toBeDefined()
        expect(user.role).toBeDefined()
    })

    test('Get user by id returns 401 for non-admin users', async () => {
        const param = { id: faker.datatype.uuid() }
        const response = await request(app)
            .get('/users/')
            .query(param)
            .set({ jwt: instructorToken })

        expect(response.statusCode).toBe(401)
    })
})
