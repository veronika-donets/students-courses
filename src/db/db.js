import { Sequelize } from 'sequelize'
import { getEnvVar } from '../helpers'

const dbName = getEnvVar('DB_NAME')
const dbUser = getEnvVar('DB_USER')
const dbPass = getEnvVar('DB_PASS')
const options = {
    host: getEnvVar('DB_HOST'),
    dialect: 'postgres',
}

export const sequelize = new Sequelize(dbName, dbUser, dbPass, options)

export async function connectToDB() {
    try {
        await sequelize.authenticate()
        console.log(`Connection to ${getEnvVar('DB_NAME')} has been established successfully.`)
    } catch (error) {
        console.error('Unable to connect to the database: ', error)
    }
}
