const metOfficeOutput = [
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
                time: "01/02/2023",
                weather: "rain",
                weatherDescription: "Light rain",
            },
        ],
    ],
];

describe("Weather-Worker should collect weather as expected", () => {
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

    it("should collect metoffice correctly", async () => {
        const { getMetOffice } = require("../../src/workers/weather-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getMetOffice();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual(metOfficeOutput);
    });

    it("should use fake MetOffice data in development", async () => {
        process.env.NODE_ENV = "development";

        const metOfficeDevOutput = [[...metOfficeOutput[0]]];
        metOfficeDevOutput[0][2] = "Weather in development";

        const { getWeather } = require("../../src/workers/weather-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        getWeather();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual(metOfficeDevOutput);
    });

    it("should collect all weather when requested", async () => {
        const { getWeather } = require("../../src/workers/weather-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        getWeather();

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls.sort()).toEqual(
            [...metOfficeOutput].sort()
        );
    });
});
