import type { Request, Response } from 'express';

import type { EndpointStatus } from '@common/types';
import OpenApiSchema from '@schema';
import absolutePath from 'benweare.co.uk-client';
import cors from 'cors';
import express from 'express';
import { storage } from '..';

const router = express.Router();

const index = `${absolutePath}/index.html`;

router.get(
    '/api/status',
    cors({ origin: '*' }),
    async (req: Request, res: Response) => {
        // Expected sources that should be collected and stored in each namespace
        const sources: { [key: string]: string[] } = {
            WEATHER: ['METOFFICE'],
            NEWS: [
                'ARS_TECHNICA',
                'NASA',
                'PCGAMER',
                'ROCK_PAPER_SHOTGUN',
                'THE_REGISTER',
                'BBC',
            ],
        };
        const sourceCount = Object.keys(sources)
            .map((key) => sources[key])
            .flat().length;

        // Check that storage can be accessed with specific namespaces
        // Set API health and collect errored collections
        const endpoints: EndpointStatus[] = Object.keys(sources).map(
            (namespace) => {
                try {
                    const errors = sources[namespace]
                        .filter(
                            (source) =>
                                !storage
                                    .collections(namespace)
                                    .map((feed) => feed.name)
                                    .includes(source)
                        )
                        .map(
                            (endpoint) =>
                                `/api/${namespace.toLowerCase()}/${endpoint.toLowerCase()}`
                        );

                    return {
                        message: `${namespace} source obtained successfully.`,
                        status: {
                            health:
                                (!errors.length && 'OPERATIONAL') ||
                                (errors.length < sources[namespace].length &&
                                    'DEGRADED') ||
                                'INOPERATIONAL',
                            errors,
                        },
                    };
                } catch (e: any) {
                    return {
                        message: `${namespace} source could not be obtained successfully.`,
                        status: {
                            health: 'INOPERATIONAL',
                            errors: sources[namespace],
                        },
                    };
                }
            }
        );

        // Flatten all errors and assign to top level status
        const errors = endpoints.map((source) => source.status.errors).flat();

        return res.status(200).json({
            response: {
                health:
                    (!errors.length && 'OPERATIONAL') ||
                    (errors.length < sourceCount && 'DEGRADED') ||
                    'INOPERATIONAL',
                errors,
                endpoints,
            },
            description: OpenApiSchema.paths['/api/status']?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    }
);

router.get('/api*', (req: Request, res: Response) =>
    res
        .status(404)
        .json({ message: `${req.method} is not defined on ${req.path}` })
);

router.get('/', (_req: Request, res: Response) => res.sendFile(index));

router.get('*', (_req: Request, res: Response) => res.sendFile(index));

export default router;
