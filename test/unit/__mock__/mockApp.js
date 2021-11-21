import dataTypes from 'sequelize'
import express from 'express'
import bodyParser from 'body-parser'
import { initModels } from '../../../src/db/db'
import { mockSequelize } from './mockSequelize'
import { mockUserModel } from './mockUser'
import nock from 'nock'
import { mockResultModel } from './mockResult'
import { mockCourseModel } from './mockCourse'
import { mockHomeworkModel } from './mockHomework'
import { mockLessonModel } from './mockLesson'
import { mockFileModel } from './mockFile'
import { defineDbRelations } from '../../../src/db/relations'

export async function launchMockApp() {
    const { Course, Homework, Lesson, User, File, Result } = initModels(mockSequelize, dataTypes)

    mockUserModel(User)
    mockCourseModel(Course, Lesson, Homework, File)
    mockResultModel(Result)
    mockFileModel(File, Homework, Lesson)
    mockHomeworkModel(Homework, File, Lesson)
    mockLessonModel(Lesson, Homework, File, Course)

    const Models = { Course, Homework, Lesson, User, File, Result }

    await defineDbRelations(mockSequelize, Models)

    return { sequelize: mockSequelize, dataTypes, Models }
}

export const createMockApp = () => {
    const app = express()

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    return app
}

export const mockSendGrid = () =>
    nock('https://api.sendgrid.com/v3').post('/mail/send').reply(200, {
        message: 'success',
    })
