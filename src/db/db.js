import { Sequelize } from 'sequelize'
import { ENVIRONMENT, getEnvVar } from '../helpers'
import {
    CourseModel,
    FileModel,
    HomeworkModel,
    LessonModel,
    ResultModel,
    UserModel,
} from '../models'

export function defineDB(Db = Sequelize) {
    if (process.env.NODE_ENV === ENVIRONMENT.TEST) {
    } else {
        const dbName = getEnvVar('DB_NAME')
        const dbUser = getEnvVar('DB_USER')
        const dbPass = getEnvVar('DB_PASS')
        const options = {
            host: getEnvVar('DB_HOST'),
            dialect: 'postgres',
        }

        return new Db(dbName, dbUser, dbPass, options)
    }
}

export async function connectToDB(db) {
    try {
        await db.authenticate()
        console.log(`Connection to ${getEnvVar('DB_NAME')} has been established successfully.`)

        return db
    } catch (error) {
        console.error('Unable to connect to the database: ', error)
    }
}

export const initModels = (db, DataTypes) => {
    const User = UserModel(db, DataTypes)
    const Course = CourseModel(db, DataTypes)
    const Lesson = LessonModel(db, DataTypes)
    const Homework = HomeworkModel(db, DataTypes)
    const File = FileModel(db, DataTypes)
    const Result = ResultModel(db, DataTypes)

    return { Course, Homework, Lesson, User, File, Result }
}
