import request from "supertest";
import { HTTPServer, app } from "../../src/server";

describe("Server should accept/reject paths as defined in validatorHandler.", () => {
    beforeAll(async () => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
    }, 5000);

    test.each([
        "/api/new",
        "/api/weather",
        "/api/anythin",
        "/api/weather?timeframe=weekly",
        "/api/forecast/huh?timeframe=weekly",
    ])("Status for %s should be 404", async (path) => {
        const result = await request(app)
            .get(path)
            .set("x-forwarded-proto", "https://test.com");
        HTTPServer.close();
        expect(result.statusCode).toBe(404);
    });

    test.each([
        "/api/news",
        "/api/news/bbc",
        "/api/news/pcgamer",
        "/api/forecasts",
        "/api/forecasts/metoffice",
    ])("Status for %s should be 200", async (path) => {
        const result = await request(app)
            .get(path)
            .set("x-forwarded-proto", "https://test.com");
        HTTPServer.close();
        expect(result.statusCode).toBe(200);
    });
});
