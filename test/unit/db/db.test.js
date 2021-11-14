import { connectToDB, defineDB } from '../../../src/db/db'
import { Sequelize } from 'sequelize'
import { jest } from '@jest/globals'
import { mockSequelize } from '../__mock__/mockSequelize'

describe('Database testing', () => {
    test('Define Database testing', () => {
        const Db = defineDB(Sequelize)

        expect(Db.options.dialect).toBe('postgres')
        expect(Db instanceof Sequelize).toBe(true)
    })

    test('Connect To Database testing', () => {
        const spy = jest.spyOn(mockSequelize, 'authenticate')
        connectToDB(mockSequelize)

        expect(spy).toBeCalledTimes(1)
    })
})
