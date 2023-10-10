import cors from 'cors';
import type { Request, RequestHandler, Response } from 'express';
import express from 'express';
import OpenApiSchema from '@schema';
import { checkSteamApi, getGameData } from '@workers/steam-worker';

const router = express.Router();

router.get('/api/steam/achieve', (async (req: Request, res: Response) => {
    try {
        return res.json({
            response: await getGameData(req),
            description:
                OpenApiSchema.paths['/api/steam/achieve']?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(parseInt(e.code)).json({ message: e.message });
    }
}) as RequestHandler);

router.get('/api/steam/status', cors({ origin: '*' }), (async (
    _req: Request,
    res: Response
) => {
    try {
        await checkSteamApi();
        return res.status(200).json({ message: 'ok' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}) as RequestHandler);

export default router;
