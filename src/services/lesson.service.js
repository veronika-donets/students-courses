import { removeHomeworksWithRelations } from './homework.service'
import { removeFilesWithS3 } from './file.service'
import Lodash from 'lodash'
import { Homework, Lesson, File, Course } from '../../index'

export const getLessonWithFiles = (id) => {
    return Lesson.findOne({
        where: { id },
        include: [
            {
                model: Homework,
                attributes: ['id', 'lessonId'],
                required: false,
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
                attributes: ['id', 'sourceId', 'originalname'],
                required: false,
            },
        ],
    })
}

export const createLesson = (courseId, title, description) => {
    return Lesson.create({ courseId, title, description })
}

export const findLessonPerCourseByTitle = (courseId, title) => {
    return Lesson.findOne({
        where: {
            courseId,
            title,
        },
        attributes: ['id', 'title'],
    })
}

export const updateLesson = (id, title, description) => {
    return Lesson.update({ title, description }, { where: { id } })
}

export const removeLessonsWithRelations = async (lessons) => {
    if (Lodash.isEmpty(lessons)) return

    const lessonsIds = lessons.map((el) => el.id)
    const lessonFiles = lessons
        .filter((el) => el.Files)
        .map((el) => el.Files)
        .flat(1)

    await removeFilesWithS3(lessonFiles)

    await Promise.all(
        lessons.map((lesson) => {
            const { Homeworks } = lesson

            if (Lodash.isEmpty(Homeworks)) return

            return removeHomeworksWithRelations(Homeworks)
        })
    )

    return Lesson.destroy({ where: { id: lessonsIds } })
}

export const findCourseFromLessonId = (id) => {
    return Lesson.findOne({
        where: { id },
        include: [
            {
                model: Course,
                attributes: ['id'],
                required: false,
            },
        ],
    })
}
