import { removeHomeworksWithRelations } from './homework.service'
import { removeFiles } from './file.service'
import Lodash from 'lodash'
import { Lesson } from '../models/lesson'
import { Homework } from '../models/homework'

export const getLessonWithFiles = (id) => {
    return Lesson.findOne({
        where: { id },
        include: [
            {
                model: Homework,
                attributes: ['id', 'lessonId'],
                include: [
                    {
                        model: File,
                        attributes: ['id'],
                        required: false,
                    },
                ],
            },
            {
                model: File,
                attributes: ['id'],
                required: false,
            },
        ],
    })
}

export const getLessonWithHomeworkById = (id, studentId) => {
    return Lesson.findOne({
        where: { id },
        include: [
            {
                model: Homework,
                where: { studentId },
                attributes: ['id', 'lessonId'],
                required: false,
            },
        ],
    })
}

export const getLessonWithFilesById = (id) => {
    return Lesson.findOne({
        where: { id },
        include: [
            {
                model: File,
                attributes: ['id'],
                required: false,
            },
        ],
    })
}

export const createLesson = (courseId, title, description) => {
    return Lesson.create({ courseId, title, description })
}

export const updateLesson = (id, title, description) => {
    return Lesson.update({ title, description }, { where: { id } })
}

export const removeLessonsWithRelations = async (lessons) => {
    if (Lodash.isEmpty(lessons)) return

    const lessonsIds = lessons.map((el) => el.id)
    const lessonFileIds = lessons.map((el) => el.Files.map((file) => file.id)).flat(1)

    await removeFiles(lessonFileIds)

    await Promise.all(
        lessons.map((lesson) => {
            const { Homeworks } = lesson

            if (Lodash.isEmpty(Homeworks)) return

            return removeHomeworksWithRelations(Homeworks)
        })
    )

    return Lesson.destroy({ where: { id: lessonsIds } })
}
