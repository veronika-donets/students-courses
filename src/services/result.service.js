import Lodash from 'lodash'
import { Result, User } from '../../index'

export const createResult = (courseId, studentId) => {
    return Result.create({ courseId, studentId })
}

export const getResultByCredentials = (courseId, studentId) => {
    return Result.findOne({ where: { courseId, studentId } })
}

export const getAllResultsByStudentId = (studentId) => {
    return Result.findAll({ where: { studentId } })
}

export const updateFeedback = (id, feedback) => {
    return Result.update({ feedback }, { where: { id } })
}

export const updateFinalMark = (id, finalMark, isCoursePassed) => {
    return Result.update({ finalMark, isCoursePassed }, { where: { id } })
}

export const getStudentsPerCourse = (courseId) => {
    return Result.findAll({
        where: { courseId },
        attributes: [],
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'firstName', 'lastName'],
                required: false,
            },
        ],
    })
}

export const removeResults = async (results) => {
    if (Lodash.isEmpty(results)) return

    const resultIds = results.map((el) => el.id)

    return Result.destroy({ where: { id: resultIds } })
}
