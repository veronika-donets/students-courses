import { jest } from '@jest/globals'
import { Course, Result, User } from '../../../index'
import { createMockApp } from '../__mock__/mockApp'
import courses from '../../../src/routes/courses.routes'
import { generateMockToken, generateMockTokenRandomId } from '../__mock__/mockAuthToken'
import { USER_ROLES } from '../../../src/helpers'
import request from 'supertest'
import faker from 'faker'
import {
    mockCourseIdWithoutInstructor,
    mockInstructorId,
    mockStudentId,
} from '../__mock__/mockResponseData'

describe('Course routes testing', () => {
    let app
    let adminToken
    let instructorToken
    let studentToken
    let studentTokenRandomId

    const spyCourseCreate = jest.spyOn(Course, 'create')
    const spyCourseUpdate = jest.spyOn(Course, 'update')
    const spyCourseFindOne = jest.spyOn(Course, 'findOne')
    const spyCourseFindAll = jest.spyOn(Course, 'findAll')
    const spyCourseDelete = jest.spyOn(Course, 'destroy')
    const spyResultFindAll = jest.spyOn(Result, 'findAll')
    const spyResultCreate = jest.spyOn(Result, 'create')
    const spyUserFindOne = jest.spyOn(User, 'findOne')

    beforeAll(async () => {
        app = createMockApp()
        app.use('/courses', courses)

        adminToken = await generateMockToken({ role: USER_ROLES.ADMIN })
        instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR }, mockInstructorId)
        studentToken = await generateMockToken({ role: USER_ROLES.STUDENT })
        studentTokenRandomId = await generateMockTokenRandomId({ role: USER_ROLES.STUDENT })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Create course success', async () => {
        const body = {
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(3),
        }
        const response = await request(app)
            .post('/courses/create')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyCourseCreate).toBeCalledTimes(1)
    })

    test('Get available courses success', async () => {
        const response = await request(app).get('/courses/available').set({ jwt: studentToken })
        const { courses } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyCourseFindAll).toBeCalledTimes(1)
        expect(courses).toBeDefined()
    })

    test('Get course success', async () => {
        const params = { id: faker.datatype.uuid() }
        const response = await request(app)
            .get('/courses/')
            .query(params)
            .set({ jwt: studentToken })
        const { course } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyCourseFindOne).toBeCalledTimes(1)
        expect(course).toBeDefined()
    })

    test('Get course for admin success', async () => {
        const params = { id: faker.datatype.uuid() }
        const response = await request(app).get('/courses/').query(params).set({ jwt: adminToken })
        const { course } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyCourseFindOne).toBeCalledTimes(1)
        expect(course).toBeDefined()
    })

    test('Get course returns 404 if id is missing', async () => {
        const response = await request(app).get('/courses/').query({}).set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
    })

    test('Get my courses for student success', async () => {
        const params = { id: faker.datatype.uuid() }
        const response = await request(app)
            .get('/courses/my')
            .query(params)
            .set({ jwt: studentToken })
        const { courses } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyResultFindAll).toBeCalledTimes(1)
        expect(courses).toBeDefined()
    })

    test('Get my courses for instructor success', async () => {
        const params = { id: faker.datatype.uuid() }
        const response = await request(app)
            .get('/courses/my')
            .query(params)
            .set({ jwt: instructorToken })
        const { courses } = response.body

        expect(response.statusCode).toBe(200)
        expect(spyResultFindAll).toBeCalledTimes(0)
        expect(courses).toBeDefined()
    })

    test('Update course success', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(3),
        }
        const response = await request(app)
            .put('/courses/update')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyCourseUpdate).toBeCalledTimes(1)
        expect(response.body.message).toBe('Course successfully updated')
    })

    test('Update course returns 404 if id is not provided', async () => {
        const body = {
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(3),
        }
        const response = await request(app)
            .put('/courses/update')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(404)
    })

    test('Assign instructor to course success', async () => {
        const body = {
            courseId: mockCourseIdWithoutInstructor,
            instructorId: mockInstructorId,
        }
        const response = await request(app)
            .put('/courses/assign')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyUserFindOne).toBeCalledTimes(1)
        expect(spyCourseUpdate).toBeCalledTimes(1)
        expect(response.body.message).toBe('Instructor successfully assigned')
    })

    test('Assign instructor to course returns 400 if instructor already assigned', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
            instructorId: mockInstructorId,
        }
        const response = await request(app)
            .put('/courses/assign')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(400)
        expect(spyCourseFindOne).toBeCalledTimes(1)
        expect(response.body.message).toBe('This instructor is already assigned to the course')
    })

    test('Assign instructor to course returns 400 if uset is not instructor', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
            instructorId: mockStudentId,
        }
        const response = await request(app)
            .put('/courses/assign')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(400)
        expect(spyUserFindOne).toBeCalledTimes(1)
        expect(response.body.message).toBe('User is not an instructor')
    })

    test('Unassign instructor from course success', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
            instructorId: mockInstructorId,
        }
        const response = await request(app)
            .put('/courses/unassign')
            .send(body)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyCourseFindOne).toBeCalledTimes(1)
        expect(spyCourseUpdate).toBeCalledTimes(1)
        expect(response.body.message).toBe('Instructor successfully unassigned')
    })

    test('Student start a course success', async () => {
        const body = {
            courseId: faker.datatype.uuid(),
        }
        const response = await request(app)
            .post('/courses/start')
            .send(body)
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(200)
        expect(spyCourseFindOne).toBeCalledTimes(1)
        expect(spyResultCreate).toBeCalledTimes(1)
        expect(response.body.message).toBe('Course successfully started')
    })

    test('Student start a course returns 404 if params are missing', async () => {
        const response = await request(app)
            .post('/courses/start')
            .send({})
            .set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
        expect(response.body.message).toBe('Course id is not provided')
    })

    test('Delete course success', async () => {
        const params = { id: faker.datatype.uuid() }
        const response = await request(app)
            .delete('/courses/')
            .query(params)
            .set({ jwt: adminToken })

        expect(response.statusCode).toBe(200)
        expect(spyCourseFindOne).toBeCalledTimes(1)
        expect(spyCourseDelete).toBeCalledTimes(1)
    })
})
