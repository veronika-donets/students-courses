import { createExpressApp } from "./src/app.js";
import http from "http";
import { envVars } from "./src/config/config.js";
import dotenv from 'dotenv';

function launchApp() {
    try {
        dotenv.config()

        const app = createExpressApp();
        const port = process.env.PORT || 8080;
        const host = process.env.NODE_ENV === envVars.dev ? '' : '0.0.0.0';

        const server = http.createServer(app);

        server.listen(port, host, () => {
            console.log(`Students Courses app started on port: ${port}, host: ${host}`);
        });
    } catch (e) {
        console.error(`Failed to start the app:`, e);
    }
}

launchApp()
