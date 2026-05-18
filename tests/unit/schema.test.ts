import {
    expect, it, describe
} from 'vitest';

describe(
    'The Documentation/Schema should provide the correct hostnames dependant on the environment', () => {
        it(
            'should provide development domains on the development environment', async () => {
                const { getServers } = await import(
                    '../../src/schema/index.ts'
                );
                const PORT = process.env['PORT'];

                // Remove env variables to use fallback value
                delete process.env['PORT'];

                expect(
                    getServers()
                ).toEqual(
                    [
                        {
                            url: 'http://localhost/',
                            description: 'Local build'
                        },
                        {
                            url: 'https://benweare-dev.herokuapp.com/',
                            description: 'Heroku-Dev'
                        },
                        {
                            url: 'http://dev.benweare.co.uk/',
                            description: 'Heroku-Dev'
                        }
                    ]
                );

                // Re-add env variables for future tests
                // Re-add env variables for future tests
                process.env['PORT'] = PORT;
            }
        );

        it(
            'should provide a default domain in development if not provided by the environment', async () => {
                const HOSTNAME = process.env['HOSTNAME'];
                const PORT = process.env['PORT'];

                // Remove env variables to use fallback value
                delete process.env['HOSTNAME'];
                delete process.env['PORT'];

                const { getServers } = await import(
                    '../../src/schema/index.ts'
                );

                expect(
                    getServers()
                ).toEqual(
                    [
                        {
                            url: 'http://localhost/',
                            description: 'Local build'
                        },
                        {
                            url: 'https://benweare-dev.herokuapp.com/',
                            description: 'Heroku-Dev'
                        },
                        {
                            url: 'http://dev.benweare.co.uk/',
                            description: 'Heroku-Dev'
                        }
                    ]
                );

                // Re-add env variables for future tests
                // Re-add env variables for future tests
                process.env['HOSTNAME'] = HOSTNAME;
                process.env['PORT'] = PORT;
            }
        );

        it(
            'should provide production domains on the production environment', async () => {
                process.env['NODE_ENV'] = 'production';

                const { getServers } = await import(
                    '../../src/schema/index.ts'
                );

                expect(
                    getServers()
                ).toEqual(
                    [
                        {
                            url: 'https://www.benweare.co.uk/',
                            description: 'Production Build'
                        }
                    ]
                );
            }
        );

        it(
            'should default the version if it is not found', async () => {
                const OpenApiSchema = await import(
                    '../../src/schema/index.ts'
                );

                expect(
                    OpenApiSchema.default.info.version
                ).toEqual(
                    process.env['npm_package_version']
                );
            }
        );
    }
);
