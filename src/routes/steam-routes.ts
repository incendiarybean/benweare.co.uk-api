import type {
    Request, Response
} from 'express';

import OpenApiSchema from '../schema/index.ts';
import express from 'express';
import { getGameData } from '../workers/steam-worker.ts';
import { errorHandler } from '../common/utils/common-utils.ts';

const router = express.Router();

router.get(
    '/api/steam/achieve', async (
        req: Request, res: Response
    ) => {
        try {
            res.json(
                {
                    response: await getGameData(
                        req
                    ),
                    description:
                OpenApiSchema.paths['/api/steam/achieve']?.get?.summary,
                    timestamp: new Date,
                    link: {
                        action: req.method,
                        href: req.path
                    }
                }
            );

            return;
        }
        catch (error) {
            return errorHandler(
                res, error
            );
        }
    }
);

export default router;
