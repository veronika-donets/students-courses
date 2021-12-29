import { CourseModel } from '../../src/models'
import { mockSequelize } from '../__mock__/mockSequelize'
import dataTypes from 'sequelize'
import { expect } from '@jest/globals'

describe('Course model testing', () => {
    const Course = CourseModel(mockSequelize, dataTypes)
    const course = new Course()

    test('Check model name', () => {
        expect(Course.modelName).toBe('Courses')
    })

    describe('Check model properties', () => {
        const props = ['id', 'title', 'description', 'instructorIds']

        props.forEach((propName) => {
            test(`Check property '${propName}'`, () => {
                expect(course).toHaveProperty(propName)
            })
        })
    })
})
