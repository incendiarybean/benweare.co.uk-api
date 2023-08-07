import request from "supertest";
import { StorageError } from "../../src/common/types";

describe("server should return error responses when processing requests fail", () => {
    jest.mock("../../src/common/utils/storage-utils", () => ({
        DataStore: class StoreMock {
            write = () => {};
            list = (...args) => {
                throw new StorageError(
                    `No items available in namespace: ${args[0]}`,
                    { status: 404 }
                );
            };
            search = (...args) => {
                throw new StorageError(
                    `Could not find collection: ${args[0]} in ${args[1]}`,
                    { status: 404 }
                );
            };
        },
    }));

    const { HTTPServer, app } = require("../../src/server");
    describe("news/weather endpoints should return appropriate error responses", () => {
        test.each([
            {
                path: "/api/news/bbc",
                type: "NEWS",
                endpoint: "bbc",
            },
            {
                path: "/api/news/bbc/articles",
                type: "NEWS",
                endpoint: "bbc",
            },
            {
                path: "/api/news/pcgamer",
                type: "NEWS",
                endpoint: "pcgamer",
            },
            {
                path: "/api/news/pcgamer/articles",
                type: "NEWS",
                endpoint: "pcgamer",
            },
            {
                path: "/api/news/rockpapershotgun",
                type: "NEWS",
                endpoint: "rockpapershotgun",
            },
            {
                path: "/api/news/rockpapershotgun/articles",
                type: "NEWS",
                endpoint: "rockpapershotgun",
            },
            {
                path: "/api/news/nasa",
                type: "NEWS",
                endpoint: "nasa",
            },
            {
                path: "/api/news/nasa/articles",
                type: "NEWS",
                endpoint: "nasa",
            },
            {
                path: "/api/forecasts/metoffice",
                type: "WEATHER",
                endpoint: "metoffice",
            },
            {
                path: "/api/forecasts/metoffice/timeseries",
                type: "WEATHER",
                endpoint: "metoffice",
            },
        ])(
            "Expected $path to return an error",
            async ({ path, type, endpoint }) => {
                const result = await request(app)
                    .get(path)
                    .set("x-forwarded-proto", "https://test.com");
                HTTPServer.close();
                expect(result.status).toEqual(404);
                expect(result.body.message).toEqual(
                    `Could not find collection: ${type} in ${endpoint}`
                );
            }
        );

        test.each([
            {
                path: "/api/news",
                type: "NEWS",
            },
            {
                path: "/api/forecasts",
                type: "WEATHER",
            },
        ])(
            "should send an error response when no collections are available",
            async ({ path, type }) => {
                const result = await request(app)
                    .get(path)
                    .set("x-forwarded-proto", "https://test.com");
                HTTPServer.close();
                expect(result.status).toEqual(404);
                expect(result.body.message).toEqual(
                    `No items available in namespace: ${type}`
                );
            }
        );
    });

    describe("steam routes should return appropriate errors", () => {
        it("should send an error response when invalid query params are sent", async () => {
            const result = await request(app)
                .get("/api/steam/achieve")
                .set("x-forwarded-proto", "https://test.com");
            HTTPServer.close();
            expect(result.status).toEqual(422);
        });

        it("should send an error response when the steam API is unavailable", async () => {
            const result = await request(app)
                .get("/api/steam/status")
                .set("x-forwarded-proto", "https://test.com");
            HTTPServer.close();
            expect(result.status).toEqual(500);
        });
    });
});
