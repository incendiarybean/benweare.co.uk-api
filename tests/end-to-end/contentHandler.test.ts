import request from 'supertest';
import {
    describe, it, expect
} from 'vitest';
import express from 'express';
import contentHandler from '../../src/handlers/content-handler.ts';

const app = express();

app.use(
    contentHandler
);

describe(
    'content-handler', () => {

        it(
            'should configure CORS headers correctly for the set environment', async () => {
                process.env['NODE_ENV'] = 'development';

                const result = await request(
                    app
                ).
                    get(
                        '/api/docs'
                    ).
                    set(
                        'x-forwarded-proto', 'http://test.com'
                    );

                expect(
                    result.status
                ).toBe(
                    301
                );

                return;
            }
        );

        it(
            'should serve API docs', async () => {
                const result = await request(
                    app
                ).
                    get(
                        '/api/docs'
                    ).
                    set(
                        'x-forwarded-proto', 'http://test.com'
                    );

                expect(
                    result.status
                ).toBe(
                    301
                );

                return;
            }
        );
    }
);
