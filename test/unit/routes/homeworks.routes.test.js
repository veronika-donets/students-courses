import { jest } from '@jest/globals'
import { Homework, Lesson, Result, File } from '../../../index'
import { createMockApp } from '../__mock__/mockApp'
import homeworks from '../../../src/routes/homeworks.routes'
import { generateMockToken, generateMockTokenRandomId } from '../__mock__/mockAuthToken'
import { USER_ROLES } from '../../../src/helpers'
import faker from 'faker'
import request from 'supertest'
import { mockFileBuffer, mockHomework, mockHomeworkId } from '../__mock__/mockResponseData'

describe('Homework routes testing', () => {
    let app
    let adminToken
    let instructorToken
    let studentToken
    let studentTokenRandomId

    const spyHomeworkUpdate = jest.spyOn(Homework, 'update')
    const spyHomeworkFindOne = jest.spyOn(Homework, 'findOne')
    const spyLessonFindOne = jest.spyOn(Lesson, 'findOne')
    const spyResultFindOne = jest.spyOn(Result, 'findOne')
    const spyHomeworkDelete = jest.spyOn(Homework, 'destroy')
    const spyFileCreate = jest.spyOn(File, 'create')

    beforeAll(async () => {
        app = createMockApp()
        app.use('/homeworks', homeworks)

        adminToken = await generateMockToken({ role: USER_ROLES.ADMIN })
        instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR })
        studentToken = await generateMockToken({ role: USER_ROLES.STUDENT })
        studentTokenRandomId = await generateMockTokenRandomId({ role: USER_ROLES.STUDENT })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Create homework returns 400 if already submitted', async () => {
        const body = {
            lessonId: faker.datatype.uuid(),
            comment: faker.datatype.uuid(),
        }

        const response = await request(app)
            .post('/homeworks/create')
            .send(body)
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(400)
        expect(spyLessonFindOne).toBeCalledTimes(1)
        expect(spyResultFindOne).toBeCalledTimes(1)
    })

    test('Create homework returns 400 request.body is missing', async () => {
        const response = await request(app)
            .post('/homeworks/create')
            .send({})
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(400)
    })

    test('Create homework returns 400 if unsupported file format', async () => {
        const response = await request(app)
            .post('/homeworks/create')
            .attach('file', mockFileBuffer, 'filename.xyz')
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(400)
    })

    test('Get homework success', async () => {
        const params = {
            id: faker.datatype.uuid(),
        }
        const response = await request(app)
            .get('/homeworks/')
            .query(params)
            .set({ jwt: studentToken })
        const { homework } = response.body

        expect(response.statusCode).toBe(200)
        expect(homework).toBeDefined()
        expect(homework.id).toBe(params.id)
        expect(homework.lessonId).toBeDefined()
        expect(homework.studentId).toBeDefined()
        expect(homework.mark).toBeDefined()
        expect(homework.comment).toBeDefined()
    })

    test('Get homework returns 404 if params are missing', async () => {
        const response = await request(app).get('/homeworks/').set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
    })

    test('Update homework with files success', async () => {
        const response = await request(app)
            .put('/homeworks/update')
            .field('homeworkId', mockHomework.id)
            .field('comment', faker.lorem.sentences(1))
            .attach('file', mockFileBuffer, 'filename.jpg')
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(200)
        expect(spyHomeworkFindOne).toBeCalledTimes(1)
        expect(spyHomeworkUpdate).toBeCalledTimes(1)
        expect(spyFileCreate).toBeCalledTimes(1)
        expect(response.body.message).toBe('Homework successfully updated')
    })

    test('Update homework returns 404 if id is not provided', async () => {
        const response = await request(app)
            .put('/homeworks/update')
            .field('comment', faker.lorem.sentences(1))
            .attach('file', mockFileBuffer, 'filename.jpg')
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
    })

    test('Update homework returns 400 if unsupported file format', async () => {
        const response = await request(app)
            .put('/homeworks/update')
            .field('homeworkId', mockHomework.id)
            .field('comment', faker.lorem.sentences(1))
            .attach('file', mockFileBuffer, 'filename.xyz')
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(400)
    })

    test('Put homework mark success', async () => {
        const body = {
            homeworkId: faker.datatype.uuid(),
            mark: faker.datatype.number({ max: 100, min: 0 }),
        }

        const response = await request(app)
            .put('/homeworks/mark')
            .send(body)
            .set({ jwt: instructorToken })

        expect(response.statusCode).toBe(200)
        expect(spyHomeworkUpdate).toBeCalledTimes(1)
        expect(spyHomeworkFindOne).toBeCalledTimes(1)
    })

    test('Put homework mark returns 404 if homework id is missing', async () => {
        const body = {
            mark: faker.datatype.number({ max: 100, min: 0 }),
        }

        const response = await request(app)
            .put('/homeworks/mark')
            .send(body)
            .set({ jwt: instructorToken })

        expect(response.statusCode).toBe(404)
    })

    test('Put homework mark returns 404 if mark is missing', async () => {
        const body = {
            homeworkId: faker.datatype.uuid(),
        }

        const response = await request(app)
            .put('/homeworks/mark')
            .send(body)
            .set({ jwt: instructorToken })

        expect(response.statusCode).toBe(404)
    })

    test('Delete marked homework returns 400', async () => {
        const params = { id: mockHomeworkId }

        const response = await request(app)
            .delete('/homeworks/')
            .query(params)
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(400)
        expect(spyHomeworkFindOne).toBeCalledTimes(1)
    })

    test('Delete another student homework returns 403', async () => {
        const params = { id: faker.datatype.uuid() }

        const response = await request(app)
            .delete('/homeworks/')
            .query(params)
            .set({ jwt: studentTokenRandomId })

        expect(response.statusCode).toBe(403)
        expect(spyHomeworkFindOne).toBeCalledTimes(1)
        expect(spyHomeworkDelete).toBeCalledTimes(0)
    })

    test('Delete homework returns 404 if id is not provided', async () => {
        const response = await request(app)
            .delete('/homeworks/')
            .query({})
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
    })
})
