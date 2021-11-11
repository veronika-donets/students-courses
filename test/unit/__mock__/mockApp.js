import dataTypes from 'sequelize'
import express from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'
import { initModels } from '../../../src/db/db'
import { mockSequelize } from './mockSequelize'
import { mockUserModel } from './mockUser'
import nock from 'nock'
import { mockResultModel } from './mockResult'

export function launchMockApp() {
    const { Course, Homework, Lesson, User, File, Result } = initModels(mockSequelize, dataTypes)

    mockUserModel(User)
    mockResultModel(Result)

    const Models = { Course, Homework, Lesson, User, File, Result }

    return { sequelize: mockSequelize, dataTypes, Models }
}

export const createMockApp = () => {
    const app = express()

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(passport.initialize())

    return app
}

export const mockSendGrid = () =>
    nock('https://api.sendgrid.com/v3').post('/mail/send').reply(200, {
        message: 'success',
    })
