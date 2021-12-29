import { mockSequelize } from '../__mock__/mockSequelize'
import dataTypes from 'sequelize'
import { expect } from '@jest/globals'
import { LessonModel } from '../../src/models'

describe('Lesson model testing', () => {
    const Lesson = LessonModel(mockSequelize, dataTypes)
    const lesson = new Lesson()

    test('Check model name', () => {
        expect(Lesson.modelName).toBe('Lessons')
    })

    describe('Check model properties', () => {
        const props = ['id', 'courseId', 'title', 'description']

        props.forEach((propName) => {
            test(`Check property '${propName}'`, () => {
                expect(lesson).toHaveProperty(propName)
            })
        })
    })
})
