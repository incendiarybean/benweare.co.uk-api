import request from "supertest";
import { HTTPServer, app } from "../src/server";

describe("Server should return expected JSON from endpoints defined in routeHandler.", () => {
    const expectedKeys = ["response", "timestamp", "description", "link"];
    test.each([
        {
            path: "/api/news/bbc",
            keys: expectedKeys,
        },
        {
            path: "/api/news/nasa",
            keys: expectedKeys,
        },
        {
            path: "/api/news/pcgamer",
            keys: expectedKeys,
        },
        {
            path: "/api/news",
            keys: expectedKeys,
        },
        {
            path: "/api/news",
            keys: expectedKeys,
        },
        {
            path: "/api/forecasts",
            keys: expectedKeys,
        },
    ])(
        "Expected $path to return an object with keys that match $keys",
        async ({ path, keys }) => {
            const result = await request(app)
                .get(path)
                .set("x-forwarded-proto", "https://test.com");
            HTTPServer.close();
            expect(Object.keys(result.body)).toEqual(keys);
        }
    );
});
