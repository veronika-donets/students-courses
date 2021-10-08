import { createExpressApp } from './src/app'
import http from 'http'
import dotenv from 'dotenv'
import { connectToDB } from './src/db'
import { getEnvVar } from './src/helpers'

async function launchApp() {
    try {
        dotenv.config()

        const app = createExpressApp()
        const port = process.env.PORT || 8080
        const host = getEnvVar('APP_HOST')

        const server = http.createServer(app)

        await connectToDB()

        server.listen(port, host, () => {
            console.log(`App started on port: ${port}, host: ${host}`)
        })
    } catch (error) {
        console.error(`Failed to start the app:`, error)
    }
}

;(async () => {
    await launchApp()
})()

//exports.name = 'value';
