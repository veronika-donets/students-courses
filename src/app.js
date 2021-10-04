import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import appRoutes from './routes/app.routes.js';
import userRoutes from './routes/users.routes.js';

export function createExpressApp() {
    const app = express();

    const corsConfig = cors({
        credentials: true,
        origin: 'http://localhost:1234',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    })

    app.use(corsConfig)

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(helmet())

    app.use('/', appRoutes);
    app.use('/users', userRoutes);

    return app
}