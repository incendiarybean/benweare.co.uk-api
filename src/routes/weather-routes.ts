import type {
    Request, Response
} from 'express';
import OpenApiSchema from '../schema/index.ts';
import express from 'express';
import { storage } from '../index.ts';
import { errorHandler } from '../common/utils/common-utils.ts';

const router = express.Router();

/*--------------*/
/*    HANDLER   */
/*--------------*/

router.get(
    '/api/forecasts/:outlet/timeseries',
    (
        req: Request, res: Response
    ) => {
        try {
            const outlet = req.params['outlet'] as string;

            res.json(
                {
                    items: storage.search(
                        'WEATHER', outlet
                    ).items,
                    description:
                    OpenApiSchema.paths['/api/forecasts/{outlet}/timeseries']?.
                        get?.summary,
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

router.get(
    '/api/forecasts/:outlet', (
        req: Request, res: Response
    ) => {
        try {
            const outlet = req.params['outlet'] as string;

            res.json(
                {
                    response: storage.search(
                        'WEATHER', outlet
                    ),
                    description:
                OpenApiSchema.paths['/api/forecasts/{outlet}']?.get?.summary,
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

router.get(
    '/api/forecasts', (
        req: Request, res: Response
    ) => {
        try {
            res.json(
                {
                    response: storage.collections(
                        'WEATHER'
                    ),
                    description: OpenApiSchema.paths['/api/forecasts']?.get?.summary,
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
