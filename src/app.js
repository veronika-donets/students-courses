import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import appRoutes from './routes/app.routes'
import userRoutes from './routes/users.routes'

export function createExpressApp() {
    const app = express()

    const corsConfig = cors({
        credentials: true,
        origin: 'http://localhost:1234',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })

    app.use(corsConfig)

    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
    app.use(helmet())

    app.use('/', appRoutes)
    app.use('/users', userRoutes)

    return app
}
