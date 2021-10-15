import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import passport from 'passport'
import appRoutes from './routes/app.routes'
import users from './routes/users.routes'
import courses from './routes/courses.routes'
import lessons from './routes/lessons.routes'
import files from './routes/files.routes'
import homeworks from './routes/homeworks.routes'
import results from './routes/results.routes'

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
    app.use(passport.initialize())
    app.use(helmet())

    app.use('/', appRoutes)
    app.use('/users', users)
    app.use('/courses', courses)
    app.use('/lessons', lessons)
    app.use('/files', files)
    app.use('/homeworks', homeworks)
    app.use('/results', results)

    return app
}
