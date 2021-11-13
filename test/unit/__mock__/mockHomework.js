import faker from 'faker'
import { getMockFileList, mockFile } from './mockFile'
import Lodash from 'lodash'
import { mockLesson } from './mockLesson'

export const randomMark = faker.random.arrayElement([
    faker.datatype.number({ max: 100, min: 0 }),
    null,
])
export const randomComment = faker.random.arrayElement([
    faker.lorem.sentences(faker.datatype.number({ max: 10, min: 0 })),
    null,
])

export const mockHomework = {
    id: faker.datatype.uuid(),
    lessonId: faker.datatype.uuid(),
    studentId: faker.datatype.uuid(),
    mark: randomMark,
    comment: randomComment,
}

const randomHomeworkId = faker.datatype.uuid()

export const getMockHomeworkWithFiles = (mockFile) => ({
    id: randomHomeworkId,
    lessonId: faker.datatype.uuid(),
    studentId: faker.datatype.uuid(),
    mark: randomMark,
    comment: randomComment,
    Files: Array.from({ length: 3 }, () => ({ ...mockFile, sourceId: randomHomeworkId })),
})

export const getMockHomeworkList = (mockHomework, { lessonId }) => {
    return lessonId.map((id) => ({ ...mockHomework, lessonId: id }))
}

export const getMockHomeworkListWithFiles = (mockHomework, { lessonId }) => {
    const files = getMockFileList(mockFile, { sourceId: mockHomework.id })
    if (lessonId.isArray) {
        return lessonId.map((id) => ({ ...mockHomework, lessonId: id, Files: files }))
    }
    return { ...mockHomework, lessonId, Files: files }
}

export const mockHomeworkModel = (Homework, File, Lesson) => {
    Homework.findOne = ({ where, include }) => {
        if (!Lodash.isEmpty(include)) {
            const models = include.map((el) => {
                if (el.model === File) {
                    const files = Array.from({ length: 3 }, () => ({
                        ...mockFile,
                        sourceId: where.id,
                    }))
                    return { Files: files }
                }
                if (el.model === Lesson) {
                    const lessons = Array.from({ length: 3 }, () => ({
                        ...mockLesson,
                        homeworkId: where.id,
                    }))
                    return { Lessons: lessons }
                }
            })
            const attachedModels = models.reduce((res, el) => ({ ...res, ...el }), {})

            return new Promise((resolve) =>
                resolve({ ...mockHomework, ...where, ...attachedModels })
            )
        }
        return new Promise((resolve) => resolve({ ...mockHomework, ...where }))
    }
    Homework.findAll = ({ where }) => {
        if (where.isArray) {
        }
        return new Promise((resolve) => resolve(getMockHomeworkList(mockHomework, where)))
    }
    Homework.create = (params) => {
        return new Promise((resolve) =>
            resolve({
                id: mockHomework.id,
                mark: null,
                comment: mockHomework.comment,
                ...params,
            })
        )
    }
    Homework.update = (params) => {
        return new Promise((resolve) => resolve({ ...mockHomework, ...params }))
    }
    Homework.destroy = () => {
        return new Promise((resolve) => resolve([1]))
    }
}
