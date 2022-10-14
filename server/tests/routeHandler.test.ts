import request from "supertest";
import { HTTPServer, app } from "..";

describe("Server should return expected JSON from endpoints defined in routeHandler.", () => {
    test.each([
        {
            path: "/api/news?outlet=bbc",
            keys: ["items", "items_length"],
        },
        {
            path: "/api/news?outlet=nasa",
            keys: ["items", "items_length"],
        },
        {
            path: "/api/news?outlet=pcgamer",
            keys: ["items", "items_length"],
        },
        {
            path: "/api/news",
            keys: ["items", "items_length"],
        },
        {
            path: "/api/news?query=notaquery",
            keys: ["items", "items_length"],
        },
        {
            path: "/api/forecast",
            keys: ["items", "items_length", "location"],
        },
        {
            path: "/api/forecast?date=2022-08-16",
            keys: ["items", "items_length", "location"],
        },
        {
            path: "/api/forecast?date=16-08-2022",
            keys: ["items", "items_length", "location", "message"],
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
