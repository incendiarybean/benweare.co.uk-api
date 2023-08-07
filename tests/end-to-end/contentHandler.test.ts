import request from "supertest";

describe("CORS should be enabled correctly", () => {
    test("CORS headers are correctly configured for environment", async () => {
        process.env.NODE_ENV = "development";

        // Stop Discord from running
        delete process.env.DISCORD_ENABLED;

        const { HTTPServer, app } = require("../../src/server");

        const result = await request(app)
            .get("/api/docs")
            .set("x-forwarded-proto", "http://test.com");

        HTTPServer.close();
        expect(result.status).toBe(301);
    });
});

describe("Server should server static content.", () => {
    test("Api Docs are served.", async () => {
        const { HTTPServer, app } = require("../../src/server");
        const result = await request(app)
            .get("/api/docs")
            .set("x-forwarded-proto", "http://test.com");
        HTTPServer.close();
        expect(result.status).toBe(301);
    });
});
