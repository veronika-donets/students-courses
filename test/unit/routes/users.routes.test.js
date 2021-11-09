import request from 'supertest'
import { jest } from '@jest/globals'
import { createMockApp } from '../__mock__/mockApp'
import users from '../../../src/routes/users.routes'

describe('User route testing', () => {
    let app

    beforeAll(() => {
        app = createMockApp()
        app.use('/users', users)
    })

    beforeEach(() => jest.resetAllMocks())

    test('Should respond with 200 status code', async () => {
        const response = await request(app).post('/users/register').send({
            firstName: 'Test',
            lastName: 'User',
            email: 'sombra.students.courses@gmail.com',
            password: 'dfgdfg1232323',
            agreeTOS: 'true',
        })

        console.log('response', response.error)

        expect(response.statusCode).toBe(200)
    })
})