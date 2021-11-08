import Sequelize from 'sequelize'
import { sequelize } from '../db/db'
import { removeLessonsWithRelations } from './lesson.service'
import Lodash from 'lodash'
import { Course } from '../models/course'
import { Lesson } from '../models/lesson'
import { Homework } from '../models/homework'
import { File } from '../models/file'
import { Result } from '../models/result'

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

export const getCourseWithRelations = (id) => {
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
        .filter((el) => el.Lessons.length >= 5 && !Lodash.isEmpty(el.instructorIds))
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

export const removeCourseWithRelations = async (course) => {
    const { id, Lessons } = course

    if (!Lodash.isEmpty(Lessons)) {
        await removeLessonsWithRelations(Lessons)
    }

    return Course.destroy({ where: { id } })
}

export const getCoursesByInstructorId = (id) => {
    return Course.findAll({
        where: {
            instructorIds: {
                [Sequelize.Op.contains]: [id],
            },
        },
        attributes: ['id'],
    })
}
