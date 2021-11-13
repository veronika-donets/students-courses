import { jest } from '@jest/globals'
import { File, Lesson } from '../../../index'
import faker from 'faker'
import { getMockLessonListWithFiles, mockLesson } from '../__mock__/mockLesson'
import {
    createLesson,
    findLessonPerCourseByTitle,
    getLessonWithFiles,
    getLessonWithFilesById,
    getLessonWithHomeworkById,
    removeLessonsWithRelations,
    updateLesson,
} from '../../../src/services/lesson.service'
import { mockFile } from '../__mock__/mockFile'

describe('Lesson service testing', () => {
    const spyLessonCreate = jest.spyOn(Lesson, 'create')
    const spyLessonFindOne = jest.spyOn(Lesson, 'findOne')
    const spyLessonUpdate = jest.spyOn(Lesson, 'update')
    const spyLessonDestroy = jest.spyOn(Lesson, 'destroy')
    const spyFilesDestroy = jest.spyOn(File, 'destroy')

    beforeEach(() => jest.clearAllMocks())

    test('Create Lesson', async () => {
        const courseId = faker.datatype.uuid()
        const title = faker.lorem.sentences(1)
        const description = faker.lorem.sentences(3)

        const lesson = await createLesson(courseId, title, description)

        expect(spyLessonCreate).toHaveBeenCalledTimes(1)
        expect(lesson.id).toBe(mockLesson.id)
        expect(lesson.courseId).toBe(courseId)
        expect(lesson.title).toBe(title)
        expect(lesson.description).toBe(description)
    })

    test('Update Lesson', async () => {
        const id = mockLesson.id
        const title = faker.lorem.sentences(1)
        const description = faker.lorem.sentences(3)

        const lesson = await updateLesson(id, title, description)

        expect(spyLessonUpdate).toHaveBeenCalledTimes(1)
        expect(lesson.id).toBe(id)
        expect(lesson.title).toBe(title)
        expect(lesson.description).toBe(description)
    })

    test('get Lesson With Files', async () => {
        const id = faker.datatype.uuid()
        const lesson = await getLessonWithFiles(id)

        expect(spyLessonFindOne).toHaveBeenCalledTimes(1)
        expect(lesson.Homeworks).toBeDefined()
        expect(lesson.Homeworks.Files).toBeDefined()
        expect(lesson.Files).toBeDefined()
    })

    test('get Lesson With Homework By Id', async () => {
        const id = faker.datatype.uuid()
        const studentId = faker.datatype.uuid()
        const lesson = await getLessonWithHomeworkById(id, studentId)

        expect(spyLessonFindOne).toHaveBeenCalledTimes(1)
        expect(lesson.Homeworks).toBeDefined()
    })

    test('getLessonWithFilesById', async () => {
        const id = faker.datatype.uuid()
        const lesson = await getLessonWithFilesById(id)

        expect(spyLessonFindOne).toHaveBeenCalledTimes(1)
        expect(lesson.Files).toBeDefined()
    })

    test('find Lesson Per Course By Title', async () => {
        const courseId = faker.datatype.uuid()
        const title = faker.lorem.sentences(1)
        const lesson = await findLessonPerCourseByTitle(courseId, title)

        expect(spyLessonFindOne).toHaveBeenCalledTimes(1)
        expect(lesson.id).toBe(mockLesson.id)
        expect(lesson.courseId).toBe(courseId)
        expect(lesson.title).toBe(title)
    })

    test('remove Lessons With Relations', async () => {
        const lessons = getMockLessonListWithFiles(mockLesson, mockFile)
        const result = await removeLessonsWithRelations(lessons)

        expect(spyFilesDestroy).toHaveBeenCalledTimes(1)
        expect(spyLessonDestroy).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([1])
    })
})
