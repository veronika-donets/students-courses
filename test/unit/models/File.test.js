import { FileModel } from '../../../src/models'
import { mockSequelize } from '../__mock__/mockSequelize'
import dataTypes from 'sequelize'
import { expect } from '@jest/globals'

describe('File model testing', () => {
    const File = FileModel(mockSequelize, dataTypes)
    const file = new File()

    test('Check model name', () => {
        expect(File.modelName).toBe('Files')
    })

    describe('Check model properties', () => {
        const props = [
            'id',
            'originalname',
            'sourceId',
            'mimetype',
            'size',
        ]

        props.forEach((propName) => {
            test(`Check property '${propName}'`, () => {
                expect(file).toHaveProperty(propName)
            })
        })
    })
})