import { createExpressApp } from '../src/app'
import mock from './__mock__/mock.routes'
import request from 'supertest'

describe('App testing', () => {
    test('createExpressApp testing', async () => {
        const app = createExpressApp()
        app.use('/test', mock)

        const response = await request(app).get('/test')

        expect(response.text).toBe('OK')
    })
})