import { sequelize } from './db'
import { User } from '../models/user'
import { Homework } from '../models/homework'
import { Course } from '../models/course'
import { Lesson } from '../models/lesson'
import { File } from '../models/file'
import { Result } from '../models/result'

export async function defineDbRelations() {
    User.hasMany(Homework, { foreignKey: 'studentId', constraints: false })
    Homework.belongsTo(User, { foreignKey: 'studentId', constraints: false })

    Course.hasMany(Lesson, { foreignKey: 'courseId', constraints: false })
    Lesson.belongsTo(Course, { foreignKey: 'courseId', constraints: false })

    Lesson.hasMany(Homework, { foreignKey: 'lessonId', constraints: false })
    Homework.belongsTo(Lesson, { foreignKey: 'lessonId', constraints: false })

    Lesson.hasMany(File, { foreignKey: 'sourceId', constraints: false })
    File.belongsTo(Lesson, { foreignKey: 'sourceId', constraints: false })

    Homework.hasMany(File, { foreignKey: 'sourceId', constraints: false })
    File.belongsTo(Homework, { foreignKey: 'sourceId', constraints: false })

    Course.hasMany(Result, { foreignKey: 'courseId', constraints: false })
    Result.belongsTo(Course, { foreignKey: 'courseId', constraints: false })

    User.hasMany(Result, { foreignKey: 'studentId', constraints: false })
    Result.belongsTo(User, { foreignKey: 'studentId', constraints: false })

    await sequelize.sync()
}
