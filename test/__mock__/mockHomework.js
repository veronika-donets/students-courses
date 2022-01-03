import faker from 'faker'
import { getMockFileList } from './mockFile'
import Lodash from 'lodash'
import { mockFile, mockHomework, mockLesson, randomComment, randomMark } from './mockResponseData'

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
    return Array.from({ length: 2 }, () => ({ ...mockHomework, lessonId, Files: files }))
}

export const mockHomeworkModel = (Homework, File, Lesson) => {
    Homework.findOne = ({ where, include }) => {
        if (!Lodash.isEmpty(include)) {
            const models = include.map((el) => {
                if (el.model === File) {
                    const files = Array.from({ length: 3 }, () => ({
                        ...mockFile,
                        //sourceId: where.id,
                    }))
                    return { Files: files }
                }
                if (el.model === Lesson) {
                    const lessons = Array.from({ length: 3 }, () => ({
                        ...mockLesson,
                    }))
                    return { Lesson: lessons }
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
    Homework.update = () => {
        return new Promise((resolve) => resolve([1]))
    }
    Homework.destroy = () => {
        return new Promise((resolve) => resolve([1]))
    }
}
