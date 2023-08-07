describe("Server should server static content.", () => {
    test("server uses default PORT", async () => {
        const loggerSpy = jest.spyOn(console, "info");
        const PORT = process.env.PORT;
        delete process.env.PORT;

        const { HTTPServer } = require("../../src/server");

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const startValue = loggerSpy.mock.lastCall[0].split("] ")[1];
        expect(startValue).toEqual("Server is active on port: 8080");

        HTTPServer.close();

        process.env.PORT = PORT;
    });
});
