import { jest } from '@jest/globals'
import { Course, Result } from '../../index'
import faker from 'faker'
import {
    assignInstructorToCourse,
    createCourse,
    findAvailableCourses,
    findCoursesByInstructorId,
    findStartedCourses,
    getCourseById,
    getCourseWithLessonsById,
    removeCourseWithRelations,
    unassignInstructorFromAllCourses,
    unassignInstructorFromCourse,
    updateCourse,
} from '../../src/services/course.service'
import { getMockCourseWithLesson } from '../__mock__/mockCourse'
import Lodash from 'lodash'
import { mockCourse, mockLesson } from '../__mock__/mockResponseData'

describe('Course service testing', () => {
    const spyCourseCreate = jest.spyOn(Course, 'create')
    const spyCourseFindOne = jest.spyOn(Course, 'findOne')
    const spyCourseFindAll = jest.spyOn(Course, 'findAll')
    const spyCourseUpdate = jest.spyOn(Course, 'update')
    const spyCourseDestroy = jest.spyOn(Course, 'destroy')
    const spyResultFindAll = jest.spyOn(Result, 'findAll')

    beforeEach(() => jest.clearAllMocks())

    test('Create Course', async () => {
        const testCourse = {
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
        }

        const course = await createCourse(testCourse)

        expect(spyCourseCreate).toHaveBeenCalledTimes(1)
        expect(course.id).toBe(mockCourse.id)
        expect(course.title).toBe(testCourse.title)
        expect(course.description).toBe(testCourse.description)
        expect(course.instructorIds).toStrictEqual([])
    })

    test('Update Course', async () => {
        const id = mockCourse.id
        const title = faker.lorem.sentences(1)
        const description = faker.lorem.sentences(3)

        const result = await updateCourse(id, title, description)

        expect(spyCourseUpdate).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([1])
    })

    test('assign Instructor To Course', async () => {
        const courseId = faker.datatype.uuid()
        const instructorId = faker.datatype.uuid()

        const course = await assignInstructorToCourse(courseId, instructorId)

        expect(spyCourseUpdate).toHaveBeenCalledTimes(1)
        expect(course.instructorIds).toStrictEqual([instructorId])
    })

    test('unassign Instructor From Course', async () => {
        const courseId = faker.datatype.uuid()
        const instructorId = faker.datatype.uuid()

        const course = await unassignInstructorFromCourse(courseId, instructorId)

        expect(spyCourseUpdate).toHaveBeenCalledTimes(1)
        expect(course.instructorIds).toStrictEqual([])
    })

    test('unassign Instructor From Course', async () => {
        const courseId = faker.datatype.uuid()
        const instructorId = faker.datatype.uuid()

        const result = await unassignInstructorFromAllCourses(courseId, instructorId)

        expect(spyCourseUpdate).toHaveBeenCalledTimes(1)
        expect(result.instructorIds).toStrictEqual([])
    })

    test('get Course By Id', async () => {
        const id = faker.datatype.uuid()
        const course = await getCourseById(id)

        expect(spyCourseFindOne).toHaveBeenCalledTimes(1)
        expect(course.id).toBe(id)
        expect(course.title).toBe(mockCourse.title)
        expect(course.description).toBe(mockCourse.description)
        expect(course.instructorIds).toStrictEqual(mockCourse.instructorIds)
    })

    test('get Course With Lessons By Id', async () => {
        const id = faker.datatype.uuid()
        const course = await getCourseWithLessonsById(id)

        expect(spyCourseFindOne).toHaveBeenCalledTimes(1)
        expect(course.Lessons).toBeDefined()
    })

    test('find Available Courses', async () => {
        const limit = 10
        const offset = 0
        const courses = await findAvailableCourses(limit, offset)

        const isActive = courses.filter(
            (el) => !Lodash.isEmpty(el.instructorIds) && el.Lessons && el.Lessons.length >= 5
        )

        expect(spyCourseFindAll).toHaveBeenCalledTimes(1)
        expect(isActive.length).toBe(courses.length)
    })

    test('find Courses By Instructor Id', async () => {
        const id = faker.datatype.uuid()
        const courses = await findCoursesByInstructorId(id)

        expect(spyCourseFindAll).toHaveBeenCalledTimes(1)
        expect(courses).toBeDefined()
    })

    test('find Started Courses', async () => {
        const studentId = faker.datatype.uuid()
        const courses = await findStartedCourses(studentId)

        expect(spyResultFindAll).toHaveBeenCalledTimes(1)
        expect(courses).toBeDefined()
    })

    test('remove Courses With Relations', async () => {
        const testCourse = getMockCourseWithLesson(mockCourse, mockLesson)
        const result = await removeCourseWithRelations(testCourse)

        expect(spyCourseDestroy).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual([1])
    })
})
