import express from 'express';
import {
    baseRoutes,
    discordRoutes,
    newsRoutes,
    steamRoutes,
    weatherRoutes
} from '../routes/index.ts';

const router = express.Router();

discordRoutes();

router.use(
    newsRoutes, weatherRoutes, steamRoutes, baseRoutes
);

export default router;
