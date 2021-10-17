import { sequelize } from '../db/db.js'
import Sequelize from 'sequelize'
import { Lesson, removeLessonsWithContains } from './lesson'
import { Result } from './result'
import { Homework } from './homework'
import { File } from './file'
import Lodash from 'lodash'

class CourseModel extends Sequelize.Model {}

export const Course = CourseModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course title should not be empty',
                },
            },
            unique: {
                args: true,
                msg: 'Course with the same title already exists',
            },
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Course description should not be empty',
                },
            },
        },
        instructorIds: {
            type: Sequelize.ARRAY(Sequelize.UUID),
            defaultValue: [],
        },
    },
    {
        modelName: 'Courses',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

export const getCourseById = (id) => {
    return Course.findOne({ where: { id } })
}

export const getCourseWithLessonsById = (id) => {
    return Course.findOne({
        where: { id },
        attributes: ['id', 'title', 'description', 'instructorIds'],
        include: [
            {
                model: Lesson,
                attributes: ['id', 'courseId', 'title', 'description'],
                required: false,
            },
        ],
    })
}

export const getCourseWithContains = (id) => {
    return Course.findOne({
        where: { id },
        attributes: ['id'],
        include: [
            {
                model: Lesson,
                attributes: ['id'],
                required: false,
                include: [
                    {
                        model: Homework,
                        attributes: ['id'],
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
            },
        ],
    })
}

export const createCourse = ({ title, description }) => {
    return Course.create({ title, description })
}

export const updateCourse = (id, title, description) => {
    return Course.update({ title, description }, { where: { id } })
}

export const assignInstructorToCourse = (courseId, instructorId) => {
    return Course.update(
        {
            instructorIds: sequelize.fn(
                'array_append',
                sequelize.col('instructorIds'),
                instructorId
            ),
        },
        { where: { id: courseId } }
    )
}

export const unassignInstructorFromCourse = (courseId, instructorId) => {
    return Course.update(
        {
            instructorIds: sequelize.fn(
                'array_remove',
                sequelize.col('instructorIds'),
                instructorId
            ),
        },
        { where: { id: courseId } }
    )
}

export const unassignInstructorFromAllCourses = (courseIds, instructorId) => {
    return Course.update(
        {
            instructorIds: sequelize.fn(
                'array_remove',
                sequelize.col('instructorIds'),
                instructorId
            ),
        },
        { where: { id: courseIds } }
    )
}

export const findAvailableCourses = async (limit, offset, isActive = true) => {
    const filter = isActive
        ? {
              include: [
                  {
                      model: Lesson,
                      attributes: ['id'],
                      required: false,
                  },
              ],
          }
        : {}

    const courses = await Course.findAll({
        limit: limit || 50,
        offset: offset,
        row: true,
        attributes: ['id', 'title', 'description', 'instructorIds'],
        ...filter,
    })

    if (!isActive) {
        return courses
    }

    return courses
        .filter((el) => el.Lessons.length >= 5)
        .map(({ id, title, description, instructorIds }) => ({
            id,
            title,
            description,
            instructorIds,
        }))
}

export const findCoursesByInstructorId = (id) => {
    return Course.findAll({
        where: {
            instructorIds: [id],
        },
        attributes: ['id', 'title', 'description', 'instructorIds'],
    })
}

export const findStartedCourses = async (studentId) => {
    const results = await Result.findAll({
        where: { studentId },
        attributes: [],
        include: [
            {
                model: Course,
                attributes: ['id', 'title', 'description', 'instructorIds'],
                required: false,
            },
        ],
    })

    return results.map((el) => el.Course)
}

export const removeCourseWithContains = async (course) => {
    const { id, Lessons } = course

    if (!Lodash.isEmpty(Lessons)) {
        await removeLessonsWithContains(Lessons)
    }

    return Course.destroy({ where: { id } })
}

export const getCoursesByInstructorId = (id) => {
    return Course.findAll({
        where: {
            instructorIds: {
                [Sequelize.Op.contains]: [id]
            }
        },
        attributes: ['id'],
    })
}
