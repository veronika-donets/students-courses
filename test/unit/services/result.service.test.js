import { jest } from '@jest/globals'
import { Result } from '../../../index'
import faker from 'faker'
import {
    createResult,
    getAllResultsByStudentId,
    getResultByCredentials, getStudentsPerCourse, removeResults,
    updateFeedback, updateFinalMark,
} from '../../../src/services/result.service'
import { getMockResultList, mockResult, randomFeedback, randomMark } from '../__mock__/mockResult'

describe('Result service testing', () => {
    const spyResultCreate = jest.spyOn(Result, 'create')
    const spyResultFindOne = jest.spyOn(Result, 'findOne')
    const spyResultFindAll = jest.spyOn(Result, 'findAll')
    const spyResultUpdate = jest.spyOn(Result, 'update')
    const spyResultDestroy = jest.spyOn(Result, 'destroy')

    beforeEach(() => jest.clearAllMocks())

    test('Create Result', async() => {
        const courseId = faker.datatype.uuid()
        const studentId = faker.datatype.uuid()

        const result = await createResult(courseId, studentId)

        expect(spyResultCreate).toHaveBeenCalledTimes(1)
        expect(result.id).toBe(mockResult.id)
        expect(result.courseId).toBe(courseId)
        expect(result.studentId).toBe(studentId)
        expect(result.isCoursePassed).toBe(false)
        expect(result.finalMark).toBeNull()
        expect(result.feedback).toBeNull()
    })

    test('get Result By Credentials', async() => {
        const courseId = faker.datatype.uuid()
        const studentId = faker.datatype.uuid()

        const result = await getResultByCredentials(courseId, studentId)

        expect(spyResultFindOne).toHaveBeenCalledTimes(1)
        expect(result.id).toBe(mockResult.id)
        expect(result.courseId).toBe(courseId)
        expect(result.studentId).toBe(studentId)
        expect(result.isCoursePassed).toBe(mockResult.isCoursePassed)
        expect(result.finalMark).toBe(mockResult.finalMark)
        expect(result.feedback).toBe(mockResult.feedback)
    })

    test('get All Results ByStudentId', async() => {
        const studentId = faker.datatype.uuid()
        const results = await getAllResultsByStudentId(studentId)
        const isMatch = results.every(res => res.studentId === studentId)

        expect(spyResultFindAll).toHaveBeenCalledTimes(1)
        expect(isMatch).toBe(true)
    })

    test('update Feedback', async() => {
        const id = mockResult.id

        const result = await updateFeedback(id, randomFeedback)

        expect(spyResultUpdate).toHaveBeenCalledTimes(1)
        expect(result.id).toBe(id)
        expect(result.courseId).toBe(mockResult.courseId)
        expect(result.studentId).toBe(mockResult.studentId)
        expect(result.isCoursePassed).toBe(mockResult.isCoursePassed)
        expect(result.finalMark).toBe(mockResult.finalMark)
    })

    test('update Final Mark', async() => {
        const id = mockResult.id
        const finalMark = randomMark
        const isCoursePassed = faker.datatype.boolean()

        const result = await updateFinalMark(id, finalMark, isCoursePassed)

        expect(spyResultUpdate).toHaveBeenCalledTimes(1)
        expect(result.id).toBe(id)
        expect(result.courseId).toBe(mockResult.courseId)
        expect(result.studentId).toBe(mockResult.studentId)
        expect(result.isCoursePassed).toBe(isCoursePassed)
        expect(result.finalMark).toBe(finalMark)
    })

    test('get Students Per Course', async() => {
        const courseId = faker.datatype.uuid()
        const results = await getStudentsPerCourse(courseId)
        const isMatch = results.every(res => res.courseId === courseId)

        expect(spyResultFindAll).toHaveBeenCalledTimes(1)
        expect(isMatch).toBe(true)
    })

    test('remove Results', async() => {
        const results = getMockResultList(mockResult)
        const result = await removeResults(results)

        expect(spyResultDestroy).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([ 1 ])
    })
})