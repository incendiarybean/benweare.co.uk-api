import request from "supertest";
import { HTTPServer, app } from "..";

describe("Server should accept/reject paths as defied in validatorHandler.", () => {
    test.each([
        "/api/news/bbc",
        "/api/weather/pcgamer",
        "/api/weather/nasa",
        "/api/weather?timeframe=weekly",
        "/forecast/huh?timeframe=weekly",
    ])("Status for %s should be 404", async (path) => {
        const result = await request(app)
            .get(path)
            .set("x-forwarded-proto", "https://test.com");
        HTTPServer.close();
        expect(result.statusCode).toBe(404);
    });

    test.each([
        "/api/news",
        "/api/news?outlet=bbc",
        "/api/news?outlet=pcgamer",
        "/api/news?outlet=nasa",
        "/api/forecast",
        "/api/forecast?date=2022-08-16",
    ])("Status for %s should be 200", async (path) => {
        const result = await request(app)
            .get(path)
            .set("x-forwarded-proto", "https://test.com");
        HTTPServer.close();
        expect(result.statusCode).toBe(200);
    });
});
