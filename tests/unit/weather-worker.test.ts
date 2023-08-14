// These mocks ensure that the real server, storage and refresher isn't used
jest.mock("../../src/server", () => ({
    IO: {
        local: {
            emit: (...args) => {},
        },
    },
}));
jest.mock("../../src/common/utils/common-utils", () => ({
    ...jest.requireActual("../../src/common/utils/common-utils"),
    staticRefresher: (...args) => {},
}));
jest.mock("../../src/common/utils/storage-utils", () => ({
    ObjectStorage: class TestObject {
        constructor() {}

        list(...args) {}

        write(...args) {}

        search(...args) {}
    },
}));

describe("Weather-Worker should collect weather as expected", () => {
    it("should collect metoffice correctly", async () => {
        const { getMetOffice } = require("../../src/workers/weather-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getMetOffice();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual([
            [
                "WEATHER",
                "MetOffice",
                "Weather in testing",
                [
                    {
                        maxFeels: "18º",
                        lowTemp: "14º",
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
                        time: "02/02/2023",
                        weather: "rain",
                        weatherDescription: "Light rain",
                    },
                ],
            ],
        ]);
    });

    it("should use fake MetOffice data in development", async () => {
        process.env.NODE_ENV = "development";

        const { getWeather } = require("../../src/workers/weather-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        getWeather();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual([
            [
                "WEATHER",
                "MetOffice",
                "Weather in development",
                [
                    {
                        maxFeels: "18º",
                        lowTemp: "14º",
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
                        time: "02/02/2023",
                        weather: "rain",
                        weatherDescription: "Light rain",
                    },
                ],
            ],
        ]);
    });

    it("should collect all weather when requested", async () => {
        const { getWeather } = require("../../src/workers/weather-worker");
        const weatherWorker = require("../../src/workers/weather-worker");

        const getMetOffice = jest.spyOn(weatherWorker, "getMetOffice");

        getWeather();

        expect(getMetOffice).toBeCalledTimes(1);
    });
});
