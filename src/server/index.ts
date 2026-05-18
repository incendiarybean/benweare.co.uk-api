import {
    contentHandler, headerHandler, routeHandler
} from '../handlers/index.ts';

import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();

const HTTPServer = http.createServer(
    app
);

if (process.env['NODE_ENV'] !== 'test') {
    HTTPServer.listen(
        process.env['PORT'] ?? 8000, () => {
            console.info(
                `[${new Date}] ENV: ${process.env['NODE_ENV']}`
            );
            console.info(
                `[${new Date}] Server is active on port: ${
                    process.env['PORT'] ?? process.env['HTTPS'] ?? 8000
                }`
            );
        }
    );
}

const IO = new Server(
    HTTPServer, { cors: { methods: ['GET'] } }
);

// SET CORS RULES \\
app.use(
    headerHandler
);

// SET CONTENT RULES \\
app.use(
    contentHandler
);

// USE ROUTES \\
app.use(
    routeHandler
);

export {
    app, IO
};
