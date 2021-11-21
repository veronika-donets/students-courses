import { jest } from '@jest/globals'
import { Homework, File } from '../../index'
import faker from 'faker'
import { getMockHomeworkWithFiles } from '../__mock__/mockHomework'
import {
    createHomework,
    getAllHomeworksPerCourse,
    getHomeworkWithFilesById,
    getHomeworkWithLessonById,
    putMark,
    removeHomeworksWithRelations,
    updateHomework,
} from '../../src/services/homework.service'
import { randomComment, randomMark, mockHomework, mockFile } from '../__mock__/mockResponseData'

describe('Homework service testing', () => {
    const spyHomeworkCreate = jest.spyOn(Homework, 'create')
    const spyHomeworkFindOne = jest.spyOn(Homework, 'findOne')
    const spyHomeworkFindAll = jest.spyOn(Homework, 'findAll')
    const spyHomeworkUpdate = jest.spyOn(Homework, 'update')
    const spyHomeworkDestroy = jest.spyOn(Homework, 'destroy')
    const spyFilesDestroy = jest.spyOn(File, 'destroy')

    beforeEach(() => jest.clearAllMocks())

    test('Create Homework', async () => {
        const lessonId = faker.datatype.uuid()
        const studentId = faker.datatype.uuid()
        const comment = randomComment

        const homework = await createHomework(lessonId, studentId, comment)

        expect(spyHomeworkCreate).toHaveBeenCalledTimes(1)
        expect(homework.id).toBe(mockHomework.id)
        expect(homework.lessonId).toBe(lessonId)
        expect(homework.studentId).toBe(studentId)
        expect(homework.comment).toBe(comment)
        expect(homework.mark).toBeNull()
    })

    test('Update Homework', async () => {
        const id = mockHomework.id

        const result = await updateHomework(id, randomComment)

        expect(spyHomeworkUpdate).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([1])
    })

    test('Put mark', async () => {
        const id = mockHomework.id

        const result = await putMark(id, randomMark)

        expect(spyHomeworkUpdate).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([1])
    })

    test('get All Homeworks Per Course', async () => {
        const lessonIds = Array.from({ length: 5 }, () => faker.datatype.uuid())
        const studentId = faker.datatype.uuid()
        const results = await getAllHomeworksPerCourse(lessonIds, studentId)
        const isMatch = results.every((res) => lessonIds.includes(res.lessonId))

        expect(spyHomeworkFindAll).toHaveBeenCalledTimes(1)
        expect(isMatch).toBe(true)
    })

    test('remove Homeworks With Relations', async () => {
        const homeworks = Array.from({ length: 5 }, () => getMockHomeworkWithFiles(mockFile))
        const result = await removeHomeworksWithRelations(homeworks)

        expect(spyFilesDestroy).toHaveBeenCalledTimes(1)
        expect(spyHomeworkDestroy).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([1])
    })

    test('get Homework With Files By Id', async () => {
        const id = faker.datatype.uuid()

        const homework = await getHomeworkWithFilesById(id)

        expect(spyHomeworkFindOne).toHaveBeenCalledTimes(1)
        expect(homework.id).toBe(id)
        expect(homework.courseId).toBe(mockHomework.courseId)
        expect(homework.studentId).toBe(mockHomework.studentId)
        expect(homework.isCoursePassed).toBe(mockHomework.isCoursePassed)
        expect(homework.finalMark).toBe(mockHomework.finalMark)
        expect(homework.feedback).toBe(mockHomework.feedback)
        expect(homework.Files).toBeDefined()
    })

    test('get Homework With Lesson By Id', async () => {
        const id = faker.datatype.uuid()

        const homework = await getHomeworkWithLessonById(id)

        expect(spyHomeworkFindOne).toHaveBeenCalledTimes(1)
        expect(homework.id).toBe(id)
        expect(homework.courseId).toBe(mockHomework.courseId)
        expect(homework.studentId).toBe(mockHomework.studentId)
        expect(homework.isCoursePassed).toBe(mockHomework.isCoursePassed)
        expect(homework.finalMark).toBe(mockHomework.finalMark)
        expect(homework.feedback).toBe(mockHomework.feedback)
        expect(homework.Lessons).toBeDefined()
    })
})
