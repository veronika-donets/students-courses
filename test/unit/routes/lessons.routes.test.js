import { jest } from '@jest/globals'
import { File, Homework, Lesson } from '../../../index'
import { createMockApp } from '../__mock__/mockApp'
import lessons from '../../../src/routes/lessons.routes'
import { generateMockToken, generateMockTokenRandomId } from '../__mock__/mockAuthToken'
import { USER_ROLES } from '../../../src/helpers'
import faker from 'faker'
import request from 'supertest'
import { mockCourse, mockFileBuffer, mockLesson, mockLessonId } from '../__mock__/mockResponseData'

describe('Lesson routes testing', () => {
    let app
    let adminToken
    let instructorToken
    let studentToken
    let studentTokenRandomId

    const spyLessonCreate = jest.spyOn(Lesson, 'create')
    const spyLessonUpdate = jest.spyOn(Lesson, 'update')
    const spyLessonFindOne = jest.spyOn(Lesson, 'findOne')
    const spyLessonDelete = jest.spyOn(Lesson, 'destroy')
    const spyFileCreate = jest.spyOn(File, 'create')
    const spyFileDelete = jest.spyOn(File, 'destroy')
    const spyHomeworkDelete = jest.spyOn(Homework, 'destroy')

    beforeAll(async () => {
        app = createMockApp()
        app.use('/lessons', lessons)

        adminToken = await generateMockToken({ role: USER_ROLES.ADMIN })
        instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR })
        studentToken = await generateMockToken({ role: USER_ROLES.STUDENT })
        studentTokenRandomId = await generateMockTokenRandomId({ role: USER_ROLES.STUDENT })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Create lesson success', async () => {
        const response = await request(app)
            .post('/lessons/create')
            .field('courseId', mockCourse.id)
            .field('title', faker.lorem.sentences(1))
            .field('description', faker.lorem.sentences(3))
            .attach('file', mockFileBuffer, 'filename.jpg')
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyLessonFindOne).toBeCalledTimes(1)
        expect(spyLessonCreate).toBeCalledTimes(1)
    })

    test('Create lesson returns 400 request.body is missing', async () => {
        const response = await request(app)
            .post('/lessons/create')
            .send({})
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(400)
    })

    test('Create lesson returns 400 if unsupported file format', async () => {
        const response = await request(app)
            .post('/lessons/create')
            .attach('file', mockFileBuffer, 'filename.xyz')
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(400)
    })

    test('Get lesson success', async () => {
        const params = {
            id: faker.datatype.uuid(),
        }
        const response = await request(app)
            .get('/lessons/')
            .query(params)
            .set({ jwt: studentToken })
        const { lesson } = response.body

        expect(response.statusCode).toBe(200)
        expect(lesson).toBeDefined()
        expect(lesson.id).toBe(params.id)
        expect(lesson.courseId).toBeDefined()
        expect(lesson.title).toBeDefined()
        expect(lesson.description).toBeDefined()
    })

    test('Get lesson returns 404 if params are missing', async () => {
        const response = await request(app).get('/lessons/').set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
    })

    test('Update lesson with files success', async () => {
        const response = await request(app)
            .put('/lessons/update')
            .field('id', mockLesson.id)
            .field('title', faker.lorem.sentences(1))
            .field('description', faker.lorem.sentences(3))
            .attach('file', mockFileBuffer, 'filename.jpg')
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyLessonFindOne).toBeCalledTimes(1)
        expect(spyLessonUpdate).toBeCalledTimes(1)
        expect(spyFileCreate).toBeCalledTimes(1)
        expect(response.body.message).toBe('Lesson successfully updated')
    })

    test('Update lesson returns 404 if id is not provided', async () => {
        const response = await request(app)
            .put('/lessons/update')
            .field('title', faker.lorem.sentences(1))
            .attach('file', mockFileBuffer, 'filename.jpg')
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(404)
    })

    test('Update lesson returns 400 if unsupported file format', async () => {
        const response = await request(app)
            .put('/lessons/update')
            .field('id', mockLesson.id)
            .field('title', faker.lorem.sentences(1))
            .field('description', faker.lorem.sentences(3))
            .attach('file', mockFileBuffer, 'filename.xyz')
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(400)
    })

    test('Delete lesson success', async () => {
        const params = { id: mockLessonId }

        const response = await request(app)
            .delete('/lessons/')
            .query(params)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyLessonFindOne).toBeCalledTimes(1)
        expect(spyLessonDelete).toBeCalledTimes(1)
        expect(spyFileDelete).toBeCalledTimes(1)
        expect(spyHomeworkDelete).toBeCalledTimes(1)
    })
})
