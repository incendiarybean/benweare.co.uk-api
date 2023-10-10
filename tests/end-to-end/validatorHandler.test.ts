import request from 'supertest';
import { HTTPServer, app } from '../../src/server';

describe('Server should accept/reject paths as defined in validatorHandler.', () => {
    beforeAll(() => {
        jest.runOnlyPendingTimers();
    });

    it.each([
        '/api/new',
        '/api/weather',
        '/api/anythin',
        '/api/weather?timeframe=weekly',
        '/api/forecast/huh?timeframe=weekly',
    ])(
        'should return a 404 for non-existent paths, example: $path',
        async (path) => {
            const result = await request(app)
                .get(path)
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();
            expect(result.statusCode).toBe(404);
        }
    );

    it.each([
        '/api/news',
        '/api/news/bbc',
        '/api/news/pcgamer',
        '/api/forecasts',
        '/api/forecasts/metoffice',
    ])(
        'should return a 200 for exiting paths, example: $path',
        async (path) => {
            const result = await request(app)
                .get(path)
                .set('x-forwarded-proto', 'https://test.com');
            HTTPServer.close();
            expect(result.statusCode).toBe(200);
        }
    );
});
