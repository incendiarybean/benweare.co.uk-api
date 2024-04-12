import { StorageError } from '../../src/common/utils/storage-utils';
import request from 'supertest';
import { steamContent } from '../data/test-data';
import { storage } from '../../src';

const mockAxios = globalThis.__mockAxios__;

describe('Server should return expected responses from endpoints defined in routeHandler.', () => {
    const testingDate = new Date();
    const { HTTPServer, app } = require('../../src/server');

    beforeAll(() => {
        jest.runOnlyPendingTimers();
    });

    beforeEach(() => {
        // Force system time for comparison
        jest.useFakeTimers();
        jest.setSystemTime(testingDate);
    });

    describe('Base Routes should return appropriate responses.', () => {
        it('should return the status of the API', async () => {
            const result = await request(app)
                .get('/api/status')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.body.message).toEqual('ok');
        });

        it('should return the client index file when requesting the base domain', async () => {
            const result = await request(app)
                .get('/')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.headers['content-type']).toEqual(
                'text/html; charset=UTF-8'
            );
        });

        it('should return the client index file when requesting any non-matching route', async () => {
            const result = await request(app)
                .get('')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.headers['content-type']).toEqual(
                'text/html; charset=UTF-8'
            );
        });

        it('should return a 404 error when requesting a non-existent API endpoint', async () => {
            const result = await request(app)
                .get('/api/not-an-endpoint')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(404);
            expect(result.body.message).toEqual(
                'GET is not defined on /api/not-an-endpoint'
            );
        });
    });

    describe('Steam endpoints should return appropriate responses.', () => {
        it('should return the status of the Steam API', async () => {
            mockAxios
                .onGet(
                    `${process.env.STEAM_API}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=`
                )
                .replyOnce(200);

            const result = await request(app)
                .get('/api/steam/status')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.body.message).toEqual('ok');
        });

        it('should make a request to the Steam API and formulate a response', async () => {
            mockAxios
                .onGet(
                    `${process.env.STEAM_API}/ISteamUserStats/GetSchemaForGame/v0002?key=${process.env.STEAM_API_KEY}&appid=TestGameID`
                )
                .replyOnce(200, steamContent);

            const output = {
                response: {
                    achievements: [
                        {
                            name: '1',
                            defaultvalue: 0,
                            displayName: 'Test Achievement',
                            hidden: 0,
                            description: 'New Achievement!',
                            icon: 'steamIcon',
                            icongray: 'steamIconGray',
                        },
                    ],
                },
                description: "Retrieve a specific game's data from Steam.",
                timestamp: '',
                link: { action: 'GET', href: '/api/steam/achieve' },
            };

            const result = await request(app)
                .get('/api/steam/achieve?gameId=TestGameID')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.body.description).toEqual(output.description);
            expect(result.body.link).toEqual(output.link);
            expect(result.body.response.achievements).toEqual(
                output.response.achievements
            );
        });

        it('should send an error response when invalid query params are sent to the achievement endpoint', async () => {
            const result = await request(app)
                .get('/api/steam/achieve')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();
            expect(result.status).toEqual(422);
        });

        it('should send an error response when the steam API is unavailable', async () => {
            const result = await request(app)
                .get('/api/steam/status')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();
            expect(result.status).toEqual(500);
        });
    });

    describe('News endpoints should return appropriate responses.', () => {
        it('should return a collection of articles in a formatted response with status 200', async () => {
            // Mock the storage object
            jest.spyOn(storage, 'search').mockReturnValueOnce({
                name: 'Test',
                items: [],
                updated: testingDate.toISOString(),
                description: "Test's Latest Test.",
            });

            const result = await request(app)
                .get('/api/news/test/articles')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({
                description: "Retrieve a specific news outlet's articles.",
                link: { action: 'GET', href: '/api/news/test/articles' },
                items: [],
                timestamp: testingDate.toISOString(),
            });
        });

        it('should return the entire stored object of the outlet with status 200', async () => {
            // Mock the storage object
            jest.spyOn(storage, 'search').mockReturnValueOnce({
                name: 'Test',
                items: [],
                updated: testingDate.toISOString(),
                description: "Test's Latest Test.",
            });

            const result = await request(app)
                .get('/api/news/test')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({
                description: 'Retrieve a specific news outlet.',
                link: { action: 'GET', href: '/api/news/test' },
                response: {
                    name: 'Test',
                    items: [],
                    updated: testingDate.toISOString(),
                    description: "Test's Latest Test.",
                },
                timestamp: testingDate.toISOString(),
            });
        });

        it('should return all stored objects of NEWS with status 200', async () => {
            // Mock the storage object
            jest.spyOn(storage, 'list').mockReturnValueOnce({});

            const result = await request(app)
                .get('/api/news/articles')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({
                description: 'Retrieve all collected news articles.',
                link: { action: 'GET', href: '/api/news/articles' },
                response: {},
                timestamp: testingDate.toISOString(),
            });
        });

        it('should return the article associated with an ID with status 200', async () => {
            // Mock the storage object
            jest.spyOn(storage, 'itemById').mockReturnValueOnce({
                title: 'Test',
                url: 'Test URL',
                img: 'Test IMG',
                name: 'Test',
                date: '1970-01-01T00:00:00.000Z',
                id: 'test-test-test',
            });

            const result = await request(app)
                .get('/api/news/articles/test-test-test')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({
                description: 'Retrieve all collected news articles.',
                link: {
                    action: 'GET',
                    href: '/api/news/articles/test-test-test',
                },
                response: {
                    title: 'Test',
                    url: 'Test URL',
                    img: 'Test IMG',
                    name: 'Test',
                    date: '1970-01-01T00:00:00.000Z',
                    id: 'test-test-test',
                },
                timestamp: testingDate.toISOString(),
            });
        });

        test.each([
            { path: '/api/news' },
            { path: '/api/news/outlet' },
            { path: '/api/news/outlet/articles' },
        ])(
            'should return a 404 if the specified news outlet collection is not found on route: $path',
            async ({ path }) => {
                jest.spyOn(storage, 'collections').mockImplementationOnce(
                    () => {
                        throw new StorageError(
                            `No items available in namespace`,
                            {
                                status: 404,
                            }
                        );
                    }
                );
                jest.spyOn(storage, 'search').mockImplementationOnce(() => {
                    throw new StorageError(`No items available in namespace`, {
                        status: 404,
                    });
                });

                const result = await request(app)
                    .get(path)
                    .set('x-forwarded-proto', 'https://test.com');
                HTTPServer.close();

                expect(result.status).toEqual(404);
                expect(result.body.message).toEqual(
                    'No items available in namespace'
                );
            }
        );

        it.each([
            { path: '/api/news' },
            { path: '/api/news/articles' },
            { path: '/api/news/articles/test-test-test' },
            { path: '/api/news/outlet' },
            { path: '/api/news/outlet/articles' },
        ])('should return a 502 if a server error occurs', async ({ path }) => {
            jest.spyOn(storage, 'collections').mockImplementationOnce(
                new Error('Failed')
            );
            jest.spyOn(storage, 'search').mockImplementationOnce(
                new Error('Failed')
            );
            jest.spyOn(storage, 'list').mockImplementationOnce(
                new Error('Failed')
            );

            const result = await request(app)
                .get(path)
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(502);
        });
    });

    describe('Weather endpoints should return appropriate responses.', () => {
        it('should return a collection of weather in a formatted response with status 200', async () => {
            // Mock the storage object
            jest.spyOn(storage, 'search').mockReturnValueOnce({
                name: 'Test',
                items: [],
                updated: testingDate.toISOString(),
                description: "Test's Latest Test.",
            });

            const result = await request(app)
                .get('/api/forecasts/test/timeseries')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({
                description: "Retrieve a specific weather outlet's timeseries.",
                link: { action: 'GET', href: '/api/forecasts/test/timeseries' },
                items: [],
                timestamp: testingDate.toISOString(),
            });
        });

        it('should return the entire stored object of the outlet with status 200', async () => {
            // Mock the storage object
            jest.spyOn(storage, 'search').mockReturnValueOnce({
                name: 'Test',
                items: [],
                updated: testingDate.toISOString(),
                description: "Test's Latest Test.",
            });

            const result = await request(app)
                .get('/api/forecasts/test')
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({
                description: 'Retrieve a specific weather outlet.',
                link: { action: 'GET', href: '/api/forecasts/test' },
                response: {
                    name: 'Test',
                    items: [],
                    updated: testingDate.toISOString(),
                    description: "Test's Latest Test.",
                },
                timestamp: testingDate.toISOString(),
            });
        });

        it.each([
            { path: '/api/forecasts' },
            { path: '/api/forecasts/weather' },
            { path: '/api/forecasts/weather/timeseries' },
        ])(
            'should return a 404 if the specified weather outlet collection is not found on route: $path',
            async ({ path }) => {
                jest.spyOn(storage, 'collections').mockImplementationOnce(
                    () => {
                        throw new StorageError(
                            `No items available in namespace`,
                            {
                                status: 404,
                            }
                        );
                    }
                );
                jest.spyOn(storage, 'search').mockImplementationOnce(() => {
                    throw new StorageError(`No items available in namespace`, {
                        status: 404,
                    });
                });

                const result = await request(app)
                    .get(path)
                    .set('x-forwarded-proto', 'https://test.com');
                HTTPServer.close();

                expect(result.status).toEqual(404);
                expect(result.body.message).toEqual(
                    'No items available in namespace'
                );
            }
        );

        it.each([
            { path: '/api/forecasts' },
            { path: '/api/forecasts/weather' },
            { path: '/api/forecasts/weather/timeseries' },
        ])('should return a 502 if a server error occurs', async ({ path }) => {
            jest.spyOn(storage, 'collections').mockImplementationOnce(() => {
                throw new Error('Server failure!');
            });
            jest.spyOn(storage, 'search').mockImplementationOnce(() => {
                throw new Error('Server failure!');
            });

            const result = await request(app)
                .get(path)
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();

            expect(result.status).toEqual(502);
            expect(result.body.message).toEqual('Server failure!');
        });
    });
});
