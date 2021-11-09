import { dataTypes as mockDataTypes, sequelize as mockSequelize } from 'sequelize-test-helpers'
import { jest } from '@jest/globals'
import express from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'
import { initModels } from '../../../src/db/db'

export const mockUserFindOne = jest.fn()
export const mockUserCreate = jest.fn()
export const mockUserUpdate = jest.fn()
export const mockUserDestroy = jest.fn()

export const mockCourseFindOne = jest.fn()
export const mockCourseCreate = jest.fn()
export const mockCourseUpdate = jest.fn()
export const mockCourseDestroy = jest.fn()

export const mockHomeworkFindOne = jest.fn()
export const mockHomeworkCreate = jest.fn()
export const mockHomeworkUpdate = jest.fn()
export const mockHomeworkDestroy = jest.fn()

export const mockLessonFindOne = jest.fn()
export const mockLessonCreate = jest.fn()
export const mockLessonUpdate = jest.fn()
export const mockLessonDestroy = jest.fn()

export const mockFileFindOne = jest.fn()
export const mockFileCreate = jest.fn()
export const mockFileUpdate = jest.fn()
export const mockFileDestroy = jest.fn()

export const mockResultFindOne = jest.fn()
export const mockResultCreate = jest.fn()
export const mockResultUpdate = jest.fn()
export const mockResultDestroy = jest.fn()

export const launchMockApp = () => {
    mockSequelize.sync = jest.fn()

    const { Course, Homework, Lesson, User, File, Result } = initModels(
        mockSequelize,
        mockDataTypes
    )

    User.findOne = mockUserFindOne
    User.create = mockUserCreate
    User.update = mockUserUpdate
    User.destroy = mockUserDestroy

    const Models = { Course, Homework, Lesson, User, File, Result }

    return { sequelize: mockSequelize, dataTypes: mockDataTypes, Models }
}

export const createMockApp = () => {
    const app = express()

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(passport.initialize())

    return app
}
