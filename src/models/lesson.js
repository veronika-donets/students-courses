import { sequelize } from '../db/db.js'
import Sequelize from 'sequelize'
import { Homework, removeHomeworksWithContains } from './homework'
import { File, removeFiles } from './file'
import Lodash from 'lodash'

class LessonModel extends Sequelize.Model {}

export const Lesson = LessonModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        courseId: {
            type: Sequelize.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course id should not be empty',
                },
            },
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Lesson title should not be empty',
                },
            },
            unique: {
                args: true,
                msg: 'Lesson with the same title already exists',
            },
        },
        description: {
            type: Sequelize.STRING,
        },
    },
    {
        modelName: 'Lessons',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

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

export const removeLessonsWithContains = async (lessons) => {
    if (Lodash.isEmpty(lessons)) return

    const lessonsIds = lessons.map((el) => el.id)
    const lessonFileIds = lessons.map((el) => el.Files.map((file) => file.id)).flat(1)

    await removeFiles(lessonFileIds)

    await Promise.all(
        lessons.map((lesson) => {
            const { Homeworks } = lesson

            if (Lodash.isEmpty(Homeworks)) return

            return removeHomeworksWithContains(Homeworks)
        })
    )

    return Lesson.destroy({ where: { id: lessonsIds } })
}
