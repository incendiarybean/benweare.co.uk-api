import request from 'supertest';

describe('CORS should be enabled correctly', () => {
    it('should configure CORS headers correctly for the set environment', async () => {
        process.env.NODE_ENV = 'development';

        const { HTTPServer, app } = require('../../src/server');

        const result = await request(app)
            .get('/api/docs')
            .set('x-forwarded-proto', 'http://test.com');

        HTTPServer.close();
        expect(result.status).toBe(301);
    });
});

describe('Server should server Swagger-UI content.', () => {
    it('should serve API docs', async () => {
        const { HTTPServer, app } = require('../../src/server');
        const result = await request(app)
            .get('/api/docs')
            .set('x-forwarded-proto', 'http://test.com');
        HTTPServer.close();
        expect(result.status).toBe(301);
    });
});
