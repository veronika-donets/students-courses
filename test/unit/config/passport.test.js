// import { jest } from '@jest/globals'
import { useAppPassport } from '../../../src/auth/passport'
import { USER_ROLES } from '../../../src/helpers'
import { Router } from 'express'
import request from 'supertest'
import { generateMockToken } from '../__mock__/mockAuthToken'
import { createExpressApp } from '../../../src/app'
import { mockAdminId, mockInstructorId, mockStudentId } from '../__mock__/mockResponseData'

describe('Passport testing', () => {
    test('useAppPassport testing', () => {
        const passport = useAppPassport()

        expect(passport).toBeDefined()

        Object.values(USER_ROLES).forEach(prop => {
            expect(passport._strategies).toHaveProperty(prop)
        })
    })

    test('Admin authentication success', async () => {
        const app = createExpressApp()
        const router = Router()
        const passport = useAppPassport()

        router.get('/', passport.authenticate([USER_ROLES.ADMIN]), (req, res) => {
            res.send('OK')
        })

        app.use('/test', router)

        const adminToken = await generateMockToken({ role: USER_ROLES.ADMIN }, mockAdminId)

        const response = await request(app).get('/test').set({ jwt: adminToken })

        expect(response.text).toBe('OK')
    })

    test('Admin authentication failed', async () => {
        const app = createExpressApp()
        const router = Router()
        const passport = useAppPassport()

        router.get('/', passport.authenticate([USER_ROLES.ADMIN]), (req, res) => {
            res.send('OK')
        })

        app.use('/test', router)

        const studentToken = await generateMockToken({ role: USER_ROLES.STUDENT }, mockStudentId)

        const response = await request(app).get('/test').set({ jwt: studentToken })

        expect(response.text).toBe('Unauthorized')
    })

    test('Instructor authentication success', async () => {
        const app = createExpressApp()
        const router = Router()
        const passport = useAppPassport()

        router.get('/', passport.authenticate([USER_ROLES.INSTRUCTOR]), (req, res) => {
            res.send('OK')
        })

        app.use('/test', router)

        const instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR }, mockInstructorId)

        const response = await request(app).get('/test').set({ jwt: instructorToken })

        expect(response.text).toBe('OK')
    })

    test('Instructor authentication failed', async () => {
        const app = createExpressApp()
        const router = Router()
        const passport = useAppPassport()

        router.get('/', passport.authenticate([USER_ROLES.INSTRUCTOR]), (req, res) => {
            res.send('OK')
        })

        app.use('/test', router)

        const studentToken = await generateMockToken({ role: USER_ROLES.STUDENT }, mockStudentId)

        const response = await request(app).get('/test').set({ jwt: studentToken })

        expect(response.text).toBe('Unauthorized')
    })

    test('Student authentication success', async () => {
        const app = createExpressApp()
        const router = Router()
        const passport = useAppPassport()

        router.get('/', passport.authenticate([USER_ROLES.STUDENT]), (req, res) => {
            res.send('OK')
        })

        app.use('/test', router)

        const studentToken = await generateMockToken({ role: USER_ROLES.STUDENT }, mockStudentId)

        const response = await request(app).get('/test').set({ jwt: studentToken })

        expect(response.text).toBe('OK')
    })

    test('Student authentication failed', async () => {
        const app = createExpressApp()
        const router = Router()
        const passport = useAppPassport()

        router.get('/', passport.authenticate([USER_ROLES.STUDENT]), (req, res) => {
            res.send('OK')
        })

        app.use('/test', router)

        const instructorToken = await generateMockToken({ role: USER_ROLES.INSTRUCTOR }, mockInstructorId)

        const response = await request(app).get('/test').set({ jwt: instructorToken })

        expect(response.text).toBe('Unauthorized')
    })
})