import { sequelize } from '../db.js'
import Sequelize from 'sequelize'
import { USER_ROLES } from '../helpers'

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
        lessonsIds: {
            type: Sequelize.ARRAY(Sequelize.UUID),
            defaultValue: [],
        },
        startedIds: {
            type: Sequelize.ARRAY(Sequelize.UUID),
            defaultValue: [],
        },
        completedIds: {
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

export const createCourse = ({ title, description }) => {
    return Course.create({ title, description })
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

export const startCourse = (courseId, studentId) => {
    return Course.update(
        {
            startedIds: sequelize.fn('array_append', sequelize.col('startedIds'), studentId),
        },
        { where: { id: courseId } }
    )
}

export const removeCourseFromStarted = (courseId, studentId) => {
    return Course.update(
        {
            startedIds: sequelize.fn('array_remove', sequelize.col('startedIds'), studentId),
        },
        { where: { id: courseId } }
    )
}

export const completeCourse = async (courseId, studentId) => {
    await removeCourseFromStarted(courseId, studentId)

    return Course.update(
        {
            completedIds: sequelize.fn('array_append', sequelize.col('completedIds'), studentId),
        },
        { where: { id: courseId } }
    )
}

export const findStartedCourses = async (studentId) => {
    return Course.findAll({
        where: {
            startedIds: {
                [Sequelize.Op.contains]: [studentId],
            },
        },
    })
}

export const findAvailableCourses = (limit, offset, isActive = true) => {
    const filter = isActive ? {
        where: sequelize.where(
            sequelize.fn('array_length', sequelize.col('lessonsIds'), 1),
            { [Sequelize.Op.gte]: 5 },
        ),
        attributes: ['id', 'title', 'description', 'instructorIds'],
    } : {}

    return Course.findAll({
        limit: limit || 50,
        offset: offset,
        row: true,
        attributes: ['id', 'title', 'description', 'instructorIds', 'lessonsIds', 'startedIds', 'completedIds'],
        ...filter
    })
}

export const findCoursesByUserId = (id, role) => {
    const filter = role === USER_ROLES.INSTRUCTOR ? {
        where: {
            instructorIds: [id]
        },
        attributes: ['id', 'title', 'description', 'instructorIds', 'lessonsIds', 'startedIds', 'completedIds'],
    } : {
        where: {
            [Sequelize.Op.or]: {
                startedIds: [id],
                completedIds: [id]
            }
        },
        attributes: ['id', 'title', 'description', 'instructorIds', 'lessonsIds', 'startedIds', 'completedIds'],
    }

    return Course.findAll({
        attributes: ['id', 'title', 'description', 'instructorIds', 'lessonsIds', 'startedIds', 'completedIds'],
        ...filter
    })
}
