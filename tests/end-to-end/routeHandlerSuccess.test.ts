import request from "supertest";
import { steamContent } from "../data/test-data";
const mockAxios = globalThis.__mockAxios__;

describe("server should return expected JSON from endpoints defined in routeHandler.", () => {
    const { HTTPServer, app } = require("../../src/server");

    beforeAll(async () => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
    }, 5000);

    describe("base routes should return messages", () => {
        it("should return the API status", async () => {
            const result = await request(app)
                .get("/api/status")
                .set("x-forwarded-proto", "https://test.com");
            HTTPServer.close();

            expect(result.body.message).toEqual("ok");
        });
    });

    describe("steam endpoints should return valid responses", () => {
        it("should return the status of the steam API", async () => {
            mockAxios
                .onGet(
                    `${process.env.STEAM_API}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=`
                )
                .replyOnce(200);

            const result = await request(app)
                .get("/api/steam/status")
                .set("x-forwarded-proto", "https://test.com");
            HTTPServer.close();

            expect(result.body.message).toEqual("ok");
        });

        it("should request a steam API URL and return achiement information", async () => {
            mockAxios
                .onGet(
                    `${process.env.STEAM_API}/ISteamUserStats/GetSchemaForGame/v0002?key=${process.env.STEAM_API_KEY}&appid=TestGameID`
                )
                .replyOnce(200, steamContent);

            const output = {
                response: {
                    achievements: [
                        {
                            name: "1",
                            defaultvalue: 0,
                            displayName: "Test Achievement",
                            hidden: 0,
                            description: "New Achievement!",
                            icon: "steamIcon",
                            icongray: "steamIconGray",
                        },
                    ],
                },
                description: "Retrieve a specific game's data from Steam.",
                timestamp: "",
                link: { action: "GET", href: "/api/steam/achieve" },
            };

            const result = await request(app)
                .get("/api/steam/achieve?gameId=TestGameID")
                .set("x-forwarded-proto", "https://test.com");
            HTTPServer.close();

            expect(result.body.description).toEqual(output.description);
            expect(result.body.link).toEqual(output.link);
            expect(result.body.response.achievements).toEqual(
                output.response.achievements
            );
        });
    });

    describe("news endpoints should return valid responses", () => {
        test.each([
            {
                path: "/api/news/bbc/articles",
                output: {
                    description: "Retrieve a specific news outlet's articles.",
                    link: { action: "GET", href: "/api/news/bbc/articles" },
                    response: [
                        {
                            date: "01/02/2023",
                            img: "test-img.png",
                            title: "Test Title",
                            url: "https://bbc.co.uk/test",
                        },
                    ],
                    timestamp: "",
                },
            },
            {
                path: "/api/news/pcgamer/articles",
                output: {
                    description: "Retrieve a specific news outlet's articles.",
                    link: { action: "GET", href: "/api/news/pcgamer/articles" },
                    response: [
                        {
                            date: "01/02/2023",
                            img: "test-img.png",
                            title: "Test Title",
                            url: "/test",
                        },
                    ],
                    timestamp: "",
                },
            },
        ])(
            "Expected $path to return an object that matches $output",
            async ({ path, output }) => {
                const result = await request(app)
                    .get(path)
                    .set("x-forwarded-proto", "https://test.com");
                HTTPServer.close();

                expect(result.body.description).toEqual(output.description);
                expect(result.body.link).toEqual(output.link);
                expect(result.body.response).toEqual(output.response);
                expect(result.body.timestamp).toBeDefined();
            }
        );

        test.each([
            {
                path: "/api/news/bbc",
                output: {
                    response: {
                        description: "BBC's Latest News.",
                    },
                    description: "Retrieve a specific news outlet.",
                    link: { action: "GET", href: "/api/news/bbc" },
                },
            },
            {
                path: "/api/news/pcgamer",
                output: {
                    response: {
                        description: "PCGamer's Latest News.",
                    },
                    description: "Retrieve a specific news outlet.",
                    link: { action: "GET", href: "/api/news/pcgamer" },
                },
            },
            {
                path: "/api/news/rockpapershotgun",
                output: {
                    response: {
                        description: "RockPaperShotgun's Latest News.",
                    },
                    description: "Retrieve a specific news outlet.",
                    link: { action: "GET", href: "/api/news/rockpapershotgun" },
                },
            },
            {
                path: "/api/news/nasa",
                output: {
                    response: {
                        description: "NASA Daily Image.",
                    },
                    description: "Retrieve a specific news outlet.",
                    link: { action: "GET", href: "/api/news/nasa" },
                },
            },
        ])(
            "Expected $path to return an object with an object that matches $items",
            async ({ path, output }) => {
                const result = await request(app)
                    .get(path)
                    .set("x-forwarded-proto", "https://test.com");
                HTTPServer.close();

                // Expect output from Endpoint
                expect(result.body.description).toEqual(output.description);
                expect(result.body.link).toEqual(output.link);

                // Expect response to be defined
                expect(result.body.response.items).toBeDefined();
                expect(result.body.response.items.length).toBeGreaterThan(0);
                expect(result.body.response.updated).toBeDefined();
                expect(result.body.response.description).toEqual(
                    output.response.description
                );
            }
        );
    });

    describe("weather endpoints should return valid responses", () => {
        test.each([
            {
                path: "/api/forecasts/metoffice/timeseries",
                output: {
                    description: "Retrieve a specific news outlet's weather.",
                    link: {
                        action: "GET",
                        href: "/api/forecasts/metoffice/timeseries",
                    },
                    items: [
                        {
                            lowTemp: "14º",
                            maxFeels: "18º",
                            maxTemp: "20º",
                            maxWindSpeed: 3,
                            time: "01/02/2023",
                            weather: "cloud",
                            weatherDescription: "Cloudy",
                        },
                        {
                            lowTemp: "13º",
                            maxFeels: "16º",
                            maxTemp: "18º",
                            maxWindSpeed: 3,
                            time: "01/02/2023",
                            weather: "rain",
                            weatherDescription: "Light rain",
                        },
                    ],
                    updated: "",
                },
            },
        ])(
            "Expected $path to return an object with keys that match $keys",
            async ({ path, output }) => {
                const result = await request(app)
                    .get(path)
                    .set("x-forwarded-proto", "https://test.com");
                HTTPServer.close();
                expect(result.body.description).toEqual(output.description);
                expect(result.body.link).toEqual(output.link);
                expect(result.body.items).toEqual(output.items);
                expect(result.body.timestamp).toBeDefined();
            }
        );

        test.each([
            {
                path: "/api/forecasts/metoffice",
                output: {
                    description: "Retrieve a specific weather outlet.",
                    link: {
                        action: "GET",
                        href: "/api/forecasts/metoffice",
                    },
                    response: {
                        name: "MetOffice",
                        items: [],
                        updated: "2023-08-03T09:21:19.088Z",
                        description: "Weather in testing",
                    },
                    timestamp: "2023-08-03T09:32:41.146Z",
                },
            },
        ])(
            "Expected $path to return an object with keys that match $output",
            async ({ path, output }) => {
                const result = await request(app)
                    .get(path)
                    .set("x-forwarded-proto", "https://test.com");
                HTTPServer.close();

                // Expect output from Endpoint
                expect(result.body.description).toEqual(output.description);
                expect(result.body.link).toEqual(output.link);
                expect(result.body.timestamp).toBeDefined();

                // Expect response to be defined
                expect(result.body.response.items).toBeDefined();
                expect(result.body.response.items.length).toBeGreaterThan(0);
                expect(result.body.response.updated).toBeDefined();
                expect(result.body.response.description).toEqual(
                    output.response.description
                );
            }
        );
    });
});
