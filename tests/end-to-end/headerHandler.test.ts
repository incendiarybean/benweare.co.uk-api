import request from 'supertest';
import {
    describe, expect, it
} from 'vitest';
import express from 'express';
import headerHandler from '../../src/handlers/header-handler.ts';

const app = express();

app.use(
    headerHandler
);

describe(
    'Server should redirect to HTTPS when HTTP is used', () => {
        it(
            'should redirect HTTP traffic with the correct status code (301)', async () => {
                const result = await request(
                    app
                ).
                    get(
                        '/'
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
            'should return a 403 if a forbidden request is made', async () => {
                const result = await request(
                    app
                ).post(
                    '/'
                );

                expect(
                    result.status
                ).toBe(
                    403
                );

                return;
            }
        );
    }
);
