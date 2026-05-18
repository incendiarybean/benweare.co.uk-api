import {
    describe, expect, it,
    vi
} from 'vitest';

describe(
    'Server should start correctly.', () => {
        it(
            'should use the default server PORT when environmental variable is not available', async () => {
                const loggerSpy = vi.spyOn(
                    console, 'info'
                );
                const PORT = process.env['PORT'];

                // Set NODE_ENV to test LISTEN
                // Set NODE_ENV to test LISTEN
                process.env['NODE_ENV'] = 'development';

                delete process.env['PORT'];

                await import(
                    '../../src/server/index.ts'
                );

                vi.useRealTimers();
                await new Promise(
                    (
                        resolve
                    ) => setTimeout(
                        resolve, 200
                    )
                );

                const startValue = loggerSpy.mock.lastCall?.[0].split(
                    '] '
                )[1];

                expect(
                    startValue
                ).toEqual(
                    'Server is active on port: 8000'
                );

                process.env['PORT'] = PORT;
            }
        );
    }
);
