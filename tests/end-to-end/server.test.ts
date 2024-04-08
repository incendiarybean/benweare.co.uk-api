describe('Server should start correctly.', () => {
    it('should use the default server PORT when environmental variable is not available', async () => {
        const loggerSpy = jest.spyOn(console, 'info');
        const PORT = process.env.PORT;
        delete process.env.PORT;

        const { HTTPServer } = require('../../src/server');

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 200));

        const startValue = loggerSpy.mock.lastCall[0].split('] ')[1];
        expect(startValue).toEqual('Server is active on port: 8000');

        HTTPServer.close();

        process.env.PORT = PORT;
    });
});
