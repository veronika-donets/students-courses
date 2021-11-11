import { HomeworkModel } from '../../../src/models'
import { mockSequelize } from '../__mock__/mockSequelize'
import dataTypes from 'sequelize'
import { expect } from '@jest/globals'

describe('Result model testing', () => {
    const Homework = HomeworkModel(mockSequelize, dataTypes)
    const homework = new Homework()

    test('Check model name', () => {
        expect(Homework.modelName).toBe('Homeworks')
    })

    describe('Check model properties', () => {
        const props = [
            'id',
            'lessonId',
            'studentId',
            'comment',
            'mark',
        ]

        props.forEach((propName) => {
            test(`Check property '${propName}'`, () => {
                expect(homework).toHaveProperty(propName)
            })
        })
    })
})