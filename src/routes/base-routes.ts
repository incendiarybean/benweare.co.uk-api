import type {
    Request, Response
} from 'express';
import type { EndpointStatus } from '../common/types.ts';
import OpenApiSchema from '../schema/index.ts';
import absolutePath from 'benweare.co.uk-client';
import cors from 'cors';
import express from 'express';
import { storage } from '../index.ts';

const router = express.Router();

const index = `${absolutePath}/index.html`;

router.get(
    '/api/status',
    cors(
        { origin: '*' }
    ),
    async (
        req: Request, res: Response
    ) => {
        // Expected sources that should be collected and stored in each namespace
        const sources: { [key: string]: { [key: string]: boolean, }, } = {
            WEATHER: { METOFFICE: false },
            NEWS: {
                ARS_TECHNICA: false,
                NASA: false,
                PCGAMER: false,
                ROCK_PAPER_SHOTGUN: false,
                THE_REGISTER: false,
                BBC: false
            }
        };

        const sourceCount = Object.keys(
            sources
        ).
            map(
                (
                    key
                ) => sources[key]
            ).
            flat().length;

        // Check that storage can be accessed with specific namespaces
        // Set API health and collect errored collections
        const endpoints: EndpointStatus[] = Object.keys(
            sources
        ).map(
            (
                namespace
            ) => {
                try {
                    if (!sources[namespace]) {
                        throw new Error(
                            `No namespace: ${namespace} was found for sources: ${sources}`
                        );
                    }

                    Object.entries(
                        sources[namespace] ?? []
                    ).forEach(
                        (
                            object
                        ) => {
                            if (sources[namespace]) {
                                sources[namespace][object[0]] = storage.
                                    collections(
                                        namespace
                                    ).
                                    map(
                                        (
                                            feed
                                        ) => feed.name
                                    ).
                                    includes(
                                        object[0]
                                    );
                            }
                        }
                    );

                    const errors = Object.entries(
                        sources[namespace]
                    ).
                        filter(
                            (
                                source
                            ) => !source[1]
                        ).
                        map(
                            (
                                endpoint
                            ) => `/api/${namespace.toLowerCase()}/${endpoint[0].toLowerCase()}`
                        );

                    return {
                        message: `${namespace} source obtained successfully.`,
                        status: {
                            health:
                                !errors.length && 'OPERATIONAL'
                                || errors.length
                                < Object.keys(
                                    sources[namespace]
                                ).length
                                && 'DEGRADED'
                                || 'INOPERATIONAL',
                            feeds: sources[namespace],
                            errors
                        }
                    };
                }
                catch {
                    const errors = Object.entries(
                        sources[namespace] ?? []
                    ).
                        filter(
                            (
                                source
                            ) => !source[1]
                        ).
                        map(
                            (
                                endpoint
                            ) => `/api/${namespace.toLowerCase()}/${endpoint[0].toLowerCase()}`
                        );

                    return {
                        message: `${namespace} source could not be obtained successfully.`,
                        status: {
                            health: 'INOPERATIONAL',
                            feeds: sources[namespace],
                            errors
                        }
                    };
                }
            }
        );

        // Flatten all errors and assign to top level status
        const errors = endpoints.filter(
            (
                source
            ) => source.status.errors.length
        );

        res.json(
            {
                response: {
                    health:
                    !errors.length && 'OPERATIONAL'
                    || errors.length < sourceCount && 'DEGRADED'
                    || 'INOPERATIONAL',
                    endpoints
                },
                description: OpenApiSchema.paths['/api/status']?.get?.summary,
                timestamp: new Date,
                link: {
                    action: req.method,
                    href: req.path
                }
            }
        );

        return;
    }
);

router.get(
    '/api{*splat}', (
        req: Request, res: Response
    ) => {
        res.
            status(
                404
            ).
            json(
                { message: `${req.method} is not defined on ${req.path}` }
            );

        return;
    }
);

router.get(
    '/', (
        _req: Request, res: Response
    ) => {
        res.sendFile(
            index
        );

        return;
    }
);

router.get(
    '{*splat}', (
        _req: Request, res: Response
    ) => {
        res.sendFile(
            index
        );

        return;
    }
);

export default router;
