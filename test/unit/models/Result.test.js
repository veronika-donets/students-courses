import { ResultModel } from '../../../src/models'
import { mockSequelize } from '../__mock__/mockSequelize'
import dataTypes from 'sequelize'
import { expect } from '@jest/globals'

describe('Result model testing', () => {
    const Result = ResultModel(mockSequelize, dataTypes)
    const result = new Result()

    test('Check model name', () => {
        expect(Result.modelName).toBe('Results')
    })

    describe('Check model properties', () => {
        const props = [
            'id',
            'courseId',
            'studentId',
            'isCoursePassed',
            'finalMark',
            'feedback',
        ]

        props.forEach((propName) => {
            test(`Check property '${propName}'`, () => {
                expect(result).toHaveProperty(propName)
            })
        })
    })
})