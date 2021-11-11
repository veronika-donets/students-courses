import { createExpressApp } from './src/app'
import http from 'http'
import dotenv from 'dotenv'
import { connectToDB, defineDB, initModels } from './src/db/db'
import { ENVIRONMENT, getEnvVar } from './src/helpers'
import { defineDbRelations } from './src/db/relations'
import DataTypes from 'sequelize'
import { launchMockApp } from './test/unit/__mock__/mockApp'

async function launchApp() {
    dotenv.config()

    try {
        const app = createExpressApp()
        const port = process.env.PORT || 8080
        const host = getEnvVar('APP_HOST')

        const server = http.createServer(app)

        const Db = defineDB()
        const sequelize = await connectToDB(Db)
        const Models = initModels(sequelize, DataTypes)

        server.listen(port, host, () => {
            console.log(`App started on port: ${port}, host: ${host}`)
        })

        return { sequelize, dataTypes: DataTypes, Models }
    } catch (error) {
        console.error(`Failed to start the app:`, error)
    }
}

export const { sequelize, dataTypes, Models } =
    process.env.NODE_ENV === ENVIRONMENT.TEST ? await launchMockApp() : await launchApp()

await defineDbRelations(sequelize, Models)

export const { Course, Homework, Lesson, User, File, Result } = Models
