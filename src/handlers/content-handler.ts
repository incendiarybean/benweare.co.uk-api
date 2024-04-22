import path from 'path';
import absolutePath from 'benweare.co.uk-client';
import cors from 'cors';
import express from 'express';
import * as swaggerUi from 'swagger-ui-slim';
import OpenApiSchema from '@schema';

const router = express.Router();

// TODO -> Implement Authorisation headers
export const origins = {
    development: [
        'http://localhost:3000',
        'http://dev.benweare.co.uk',
        'https://dev.benweare.co.uk',
        'https://tauri.localhost',
    ],
    production: ['https://benweare.co.uk', 'https://tauri.localhost'],
};

/**
 * Set over-arching CORS, do not allow requests from external entities
 * This is overwritten in a couple of places for use externally e.g. status checks
 */
router.use(
    cors({
        origin:
            process.env.NODE_ENV !== 'development'
                ? [...origins.production]
                : [...origins.development],
        methods: 'GET,HEAD',
    })
);
router.use(express.json());

/**
 * This sets the path of the client module as static files
 */
router.use(express.static(absolutePath));
router.use(
    '/favicon.ico',
    express.static(path.join(__dirname, `${absolutePath}/favicon.ico`))
);
router.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.build(OpenApiSchema, {
        customSiteTitle: "Ben's API Docs",
        faviconUrl: `/favicon.ico`,
    })
);

export default router;
