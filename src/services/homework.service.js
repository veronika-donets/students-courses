import Lodash from 'lodash'
import { removeFilesWithS3 } from './file.service'
import { Homework, Lesson, File } from '../../index'

export const getHomeworkWithFilesById = (id) => {
    return Homework.findOne({
        where: { id },
        attributes: ['id', 'lessonId', 'studentId', 'comment', 'mark'],
        include: [
            {
                model: File,
                attributes: ['id', 'sourceId', 'originalname'],
                required: false,
            },
        ],
    })
}

export const getHomeworkWithLessonById = (id) => {
    return Homework.findOne({
        where: { id },
        attributes: ['id', 'lessonId', 'studentId', 'comment', 'mark'],
        include: [
            {
                model: Lesson,
                attributes: ['courseId'],
                required: false,
            },
        ],
    })
}

export const getAllHomeworksPerCourse = (lessonIds, studentId) => {
    return Homework.findAll({
        where: { lessonId: lessonIds, studentId },
        attributes: ['id', 'lessonId', 'studentId', 'comment', 'mark'],
    })
}

export const createHomework = (lessonId, studentId, comment) => {
    return Homework.create({ lessonId, studentId, comment })
}

export const updateHomework = (id, comment) => {
    return Homework.update({ comment }, { where: { id } })
}

export const putMark = (id, mark) => {
    return Homework.update({ mark }, { where: { id } })
}

export const removeHomeworksWithRelations = async (homeworks) => {
    if (Lodash.isEmpty(homeworks)) return

    const homeworkIds = homeworks.map((el) => el.id)
    const homeworkFiles = homeworks.map((el) => el.Files).flat(1)

    await removeFilesWithS3(homeworkFiles)

    return Homework.destroy({ where: { id: homeworkIds } })
}
