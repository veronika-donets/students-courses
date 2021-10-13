import { sequelize } from '../db.js'
import Sequelize from 'sequelize'
import { VALIDATION_REGEX } from '../helpers'
import Lodash from 'lodash'
import { removeFile } from './file'

class HomeworkModel extends Sequelize.Model {}

export const Homework = HomeworkModel.init(
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        lessonId: {
            type: Sequelize.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Lesson id should not be empty',
                },
            },
        },
        studentId: {
            type: Sequelize.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Student id should not be empty',
                },
            },
        },
        comment: {
            type: Sequelize.STRING,
        },
        uploadedFileIds: {
            type: Sequelize.ARRAY(Sequelize.UUID),
            defaultValue: [],
        },
        mark: {
            type: Sequelize.INTEGER,
            validate: {
                is: {
                    args: VALIDATION_REGEX.MARK,
                    msg: 'Mark must be from 0 to 100',
                },
            },
        },
    },
    {
        modelName: 'Homeworks',
        sequelize,
    }
)
;(async () => {
    await sequelize.sync()
})()

export const getHomeworkById = (id) => {
    return Homework.findOne({ where: { id } })
}

export const getHomeworkByCredentials = (lessonId, studentId) => {
    return Homework.findOne({ where: { lessonId, studentId } })
}

export const createHomework = (lessonId, studentId, uploadedFileIds, comment) => {
    return Homework.create({ lessonId, studentId, uploadedFileIds, comment })
}

export const updateHomework = (id, uploadedFileIds, comment) => {
    return Homework.update({ uploadedFileIds, comment }, { where: { id } })
}

export const putMark = (id, mark) => {
    return Homework.update({ mark }, { where: { id } })
}

export const removeMark = (id) => {
    return Homework.update({ mark: null }, { where: { id } })
}

export const removeHomework = (id) => {
    return Homework.destroy({ where: { id } })
}

export const removeHomeworkWithFiles = async (id) => {
    const { uploadedFileIds } = await getHomeworkById(id)
    if (!Lodash.isEmpty(uploadedFileIds)) {
        await Promise.all(uploadedFileIds.map((id) => removeFile(id)))
    }
    return Homework.destroy({ where: { id } })
}
