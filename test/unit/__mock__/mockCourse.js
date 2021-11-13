import faker from 'faker'
import Lodash from 'lodash'
import { mockLesson } from './mockLesson'

const randomLength = faker.datatype.number({ min: 0, max: 20 })
const idList = Array.from({ length: randomLength }, () => faker.datatype.uuid())

export const mockCourse = {
    id: faker.datatype.uuid(),
    title: faker.lorem.sentences(1),
    description: faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
    instructorIds: faker.random.arrayElement([idList, null]),
}

export const getMockCourseWithLesson = (mockCourse, mockLesson, where) => {
    const randomLength = faker.datatype.number({ min: 0, max: 20 })
    const lessons = Array.from({ length: randomLength }, () => ({ ...mockLesson }))
    return { ...mockCourse, ...where, Lessons: lessons }
}

export const getMockCourseList = (mockCourse, mockLesson, where) => {
    return Array.from({ length: 3 }, () => getMockCourseWithLesson(mockCourse, mockLesson, where))
}

export const mockCourseModel = (Course, Lesson) => {
    Course.findOne = ({ where, include }) => {
        if (!Lodash.isEmpty(include)) {
            const models = include.map((el) => {
                if (el.model === Lesson) {
                    const lessons = Array.from({ length: 3 }, () => ({
                        ...mockLesson,
                        courseId: where.id,
                    }))
                    return { Lessons: lessons }
                }
            })
            const attachedModels = models.reduce((res, el) => ({ ...res, ...el }), {})

            return new Promise((resolve) => resolve({ ...mockCourse, ...where, ...attachedModels }))
        }
        return new Promise((resolve) => resolve({ ...mockCourse, ...where }))
    }
    Course.findAll = ({ where }) => {
        return new Promise((resolve) => resolve(getMockCourseList(mockCourse, mockLesson, where)))
    }
    Course.create = (params) => {
        return new Promise((resolve) =>
            resolve({
                id: mockCourse.id,
                instructorIds: [],
                ...params,
            })
        )
    }
    Course.update = (params) => {
        if (params.instructorIds && params.instructorIds.fn === 'array_append') {
            const value = params.instructorIds.args[1]
            return new Promise((resolve) =>
                resolve({ ...mockCourse, ...params, instructorIds: [value] })
            )
        } else if (params.instructorIds && params.instructorIds.fn === 'array_remove') {
            return new Promise((resolve) =>
                resolve({ ...mockCourse, ...params, instructorIds: [] })
            )
        }
        return new Promise((resolve) => resolve({ ...mockCourse, ...params }))
    }
    Course.destroy = () => {
        return new Promise((resolve) => resolve([1]))
    }
}
