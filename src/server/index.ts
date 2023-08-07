import http from "http";
import express from "express";
import { Server } from "socket.io";
import { contentHandler, headerHandler, routeHandler } from "@handlers/index";

export const app = express();

export const HTTPServer = http
    .createServer(app)
    .listen(process.env.PORT ?? 8080, () => {
        console.info(`[${new Date()}] ENV: ${process.env.NODE_ENV}`);
        console.info(
            `[${new Date()}] Server is active on port: ${
                process.env.PORT ?? process.env.HTTPS ?? 8080
            }`
        );
    });

export const IO = new Server(HTTPServer, {
    cors: {
        methods: ["GET"],
    },
});

// SET CORS RULES \\
app.use(headerHandler);

// SET CONTENT RULES \\
app.use(contentHandler);

// USE ROUTES \\
app.use(routeHandler);
