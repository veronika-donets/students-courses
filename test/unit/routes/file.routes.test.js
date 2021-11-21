import { jest } from '@jest/globals'
import { File } from '../../../index'
import { createMockApp } from '../__mock__/mockApp'
import { generateMockToken } from '../__mock__/mockAuthToken'
import { USER_ROLES } from '../../../src/helpers'
import faker from 'faker'
import request from 'supertest'
import files from '../../../src/routes/files.routes'
import passport from '../../../src/auth'

describe('File routes testing', () => {
    let app
    let studentToken

    const spyFileFindOne = jest.spyOn(File, 'findOne')

    beforeAll(async () => {
        app = createMockApp()
        app.use(passport.initialize())
        app.use('/files', files)

        studentToken = await generateMockToken({ role: USER_ROLES.STUDENT })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Get file success', async () => {
        const id = faker.datatype.uuid()
        const response = await request(app).get(`/files/${id}`).set({ jwt: studentToken })

        expect(response.statusCode).toBe(200)
        expect(spyFileFindOne).toBeCalledTimes(1)
    })

    test('Get feedback returns 404 if params are missing', async () => {
        const response = await request(app).get('/files/').set({ jwt: studentToken })

        expect(response.statusCode).toBe(404)
    })
})
