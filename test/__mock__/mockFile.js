import Lodash from 'lodash'
import { mockFile, mockHomework, mockLesson, mockResult, mockCourse } from './mockResponseData'

export const getMockFileList = (mockFile, where, count) => {
    const file = { ...mockFile, ...where }
    return Array.from({ length: count }, () => ({ ...file }))
}

export const mockFileModel = (File, Homework, Lesson) => {
    File.findOne = ({ where, include }) => {
        if (!Lodash.isEmpty(include)) {
            const models = include.map((el) => {
                if (el.model === Homework) {
                    const homeworks = Array.from({ length: 3 }, () => ({
                        ...mockHomework,
                        sourceId: where.id,
                    }))
                    return { Homework: homeworks }
                }
                if (el.model === Lesson) {
                    const lessons = Array.from({ length: 3 }, () => ({
                        ...mockLesson,
                        homeworkId: where.id,
                    }))
                    const lessonsWithRelations = lessons.map((el) => {
                        const course = { ...mockCourse, Results: mockResult }
                        return { ...el, Courses: course }
                    })
                    return { Lesson: lessonsWithRelations }
                }
            })
            const attachedModels = models.reduce((res, el) => ({ ...res, ...el }), {})

            return new Promise((resolve) => resolve({ ...mockFile, ...where, ...attachedModels }))
        }

        return new Promise((resolve) => resolve({ ...mockFile, ...where }))
    }
    File.findAll = ({ where }) => {
        return new Promise((resolve) => resolve(getMockFileList(mockFile, where)))
    }
    File.create = (params) => {
        return new Promise((resolve) =>
            resolve({
                ...mockFile,
                ...params,
            })
        )
    }
    File.update = (params) => {
        return new Promise((resolve) => resolve({ ...mockFile, ...params }))
    }
    File.destroy = () => {
        return new Promise((resolve) => resolve([1]))
    }
}
