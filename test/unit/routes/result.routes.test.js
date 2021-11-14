import { jest } from '@jest/globals'
import { Result } from '../../../index'
import { createMockApp } from '../__mock__/mockApp'
import results from '../../../src/routes/results.routes'
import { generateMockToken } from '../__mock__/mockAuthToken'
import { USER_ROLES } from '../../../src/helpers'
import faker from 'faker'
import request from 'supertest'

describe('Result routes testing', () => {
    let app
    let adminToken
    let instructorToken
    let studentToken

    const spyResultUpdate = jest.spyOn(Result, 'update')
    const spyResultFindAll = jest.spyOn(Result, 'findAll')

    beforeAll(async () => {
        app = createMockApp()
        app.use('/results', results)

        adminToken = await generateMockToken({ role: USER_ROLES.ADMIN })
        instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR })
        studentToken = await generateMockToken({ role: USER_ROLES.STUDENT })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Put feedback success', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
            studentId: faker.datatype.uuid(),
            feedback: faker.lorem.sentences(faker.datatype.number({ max: 10, min: 1 })),
        }

        const response = await request(app)
            .put('/results/feedback')
            .send(body)
            .set({ jwt: instructorToken })
        const { message } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyResultUpdate).toBeCalledTimes(1)
        expect(message).toBe('Feedback has been successfully given')
    })

    test('Put feedback returns 401 if student token send', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
            studentId: faker.datatype.uuid(),
            feedback: faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
        }

        const response = await request(app)
            .put('/results/feedback')
            .send(body)
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(401)
    })

    test('Put feedback returns 404 if params are missing', async () => {
        const body = {
            courseId: '',
            studentId: faker.datatype.uuid(),
            feedback: faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
        }

        const response = await request(app)
            .put('/results/feedback')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(404)
    })

    test('Get feedback success', async () => {
        const params = { courseId: faker.datatype.uuid() }
        const response = await request(app).get('/results/').query(params).set({ jwt: adminToken })
        const { students } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyResultFindAll).toBeCalledTimes(1)
        expect(students).toBeDefined()
    })

    test('Get feedback returns 404 if params are missing', async () => {
        const response = await request(app).get('/results/').query({}).set({ jwt: adminToken })

        expect(response.statusCode).toBe(404)
    })
})
