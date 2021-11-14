import Lodash from 'lodash'
import { getMockHomeworkListWithFiles } from './mockHomework'
import { mockHomework, mockLesson, mockFile, mockCourse } from './mockResponseData'

export const getMockLessonList = (mockLesson, where) => {
    const lesson = { ...mockLesson, ...where }
    return Array.from({ length: 3 }, () => ({ ...lesson }))
}

export const getMockLessonListWithFiles = (mockLesson, mockFile) => {
    const files = Array.from({ length: 2 }, () => ({ ...mockFile }))
    return Array.from({ length: 3 }, () => ({ ...mockLesson, Files: files }))
}

export const mockLessonModel = (Lesson, Homework, File, Course) => {
    Lesson.findOne = ({ where, include }) => {
        if (where.title) {
            return new Promise((resolve) => resolve(null))
        }
        if (!Lodash.isEmpty(include)) {
            const models = include.map((el) => {
                if (el.model === File) {
                    const files = Array.from({ length: 3 }, () => ({
                        ...mockFile,
                        sourceId: where.id,
                    }))
                    return { Files: files }
                }
                if (el.model === Homework) {
                    const homeworks = getMockHomeworkListWithFiles(mockHomework, {
                        lessonId: where.id,
                    })
                    return { Homeworks: homeworks }
                }
                if (el.model === Course) {
                    return { Course: mockCourse }
                }
            })
            const attachedModels = models.reduce((res, el) => ({ ...res, ...el }), {})

            return new Promise((resolve) => resolve({ ...mockLesson, ...where, ...attachedModels }))
        }
        return new Promise((resolve) => resolve({ ...mockLesson, ...where }))
    }
    Lesson.findAll = ({ where }) => {
        return new Promise((resolve) => resolve(getMockLessonList(mockLesson, where)))
    }
    Lesson.create = (params) => {
        return new Promise((resolve) =>
            resolve({
                id: mockLesson.id,
                isCoursePassed: false,
                finalMark: null,
                feedback: null,
                ...params,
            })
        )
    }
    Lesson.update = (params) => {
        return new Promise((resolve) => resolve({ ...mockLesson, ...params }))
    }
    Lesson.destroy = () => {
        return new Promise((resolve) => resolve([1]))
    }
}
