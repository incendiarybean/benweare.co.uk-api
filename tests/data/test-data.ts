import { readFileSync } from "fs";

const template = readFileSync("./tests/data/default.html", "utf8");

const replacer = (
    input: string,
    container: string,
    divider: string,
    title: string,
    image: string,
    innerDiv: string = ""
) => {
    const output = input
        .replace(/to-replace-article-container/g, container)
        .replace(/to-replace-article-divider/g, divider)
        .replace(/to-replace-title-class/g, title)
        .replace(/to-replace-inner-title-div/g, innerDiv)
        .replace(/to-replace-image-class/g, image);

    return output;
};

export const rpsContent = () => {
    return replacer(
        template,
        "articles",
        "li",
        "title",
        "thumbnail_image",
        " <div>Test Title</div>"
    );
};

export const pcgContent = () => {
    return replacer(
        template,
        "news/news/latest",
        "listingResult",
        "article-name",
        "article-lead-image-wrap"
    );
};

export const bbcContent = () => {
    return replacer(
        template,
        "topos-component",
        "gs-t-News",
        "gs-c-promo-heading__title",
        ""
    );
};

export const genericContent = () => {
    return replacer(template, "container", "article", "title", "image");
};

export const nasaContent = {
    copyright: "name",
    date: "2023-02-01",
    explanation: "Test Explanation",
    hdurl: "test-img.png",
    media_type: "image",
    service_version: "v1",
    title: "Test Title",
    url: "test-image.png",
};

export const metofficeContent = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {},
            properties: {
                location: { name: "testing" },
                requestPointDistance: 12,
                modelRunDate: "2023-02-01T08:00Z",
                timeSeries: [
                    {
                        time: "2023-02-01T00:00Z",
                        midday10MWindSpeed: 2.83,
                        midnight10MWindSpeed: 2.93,
                        midday10MWindDirection: 256,
                        midnight10MWindDirection: 117,
                        midday10MWindGust: 7.72,
                        midnight10MWindGust: 8.75,
                        middayVisibility: 29234,
                        midnightVisibility: 999,
                        middayRelativeHumidity: 61.04,
                        midnightRelativeHumidity: 94.69,
                        middayMslp: 100220,
                        midnightMslp: 99270,
                        maxUvIndex: 6,
                        daySignificantWeatherCode: 7,
                        nightSignificantWeatherCode: 6,
                        dayMaxScreenTemperature: 19.56,
                        nightMinScreenTemperature: 13.62,
                        dayUpperBoundMaxTemp: 20.58,
                        nightUpperBoundMinTemp: 14.3,
                        dayLowerBoundMaxTemp: 17.99,
                        nightLowerBoundMinTemp: 12.6,
                        dayMaxFeelsLikeTemp: 18.38,
                        nightMinFeelsLikeTemp: 12.53,
                        dayUpperBoundMaxFeelsLikeTemp: 18.38,
                        nightUpperBoundMinFeelsLikeTemp: 12.55,
                        dayLowerBoundMaxFeelsLikeTemp: 16.48,
                        nightLowerBoundMinFeelsLikeTemp: 11.2,
                        dayProbabilityOfPrecipitation: 42,
                        nightProbabilityOfPrecipitation: 37,
                        dayProbabilityOfSnow: 0,
                        nightProbabilityOfSnow: 0,
                        dayProbabilityOfHeavySnow: 0,
                        nightProbabilityOfHeavySnow: 0,
                        dayProbabilityOfRain: 42,
                        nightProbabilityOfRain: 37,
                        dayProbabilityOfHeavyRain: 21,
                        nightProbabilityOfHeavyRain: 19,
                        dayProbabilityOfHail: 0,
                        nightProbabilityOfHail: 3,
                        dayProbabilityOfSferics: 0,
                        nightProbabilityOfSferics: 2,
                    },
                    {
                        time: "2023-02-01T00:00Z",
                        midday10MWindSpeed: 3,
                        midnight10MWindSpeed: 4.67,
                        midday10MWindDirection: 156,
                        midnight10MWindDirection: 331,
                        midday10MWindGust: 5.76,
                        midnight10MWindGust: 10.05,
                        middayVisibility: 7802,
                        midnightVisibility: 24824,
                        middayRelativeHumidity: 93.82,
                        midnightRelativeHumidity: 88.89,
                        middayMslp: 98380,
                        midnightMslp: 99720,
                        maxUvIndex: 5,
                        daySignificantWeatherCode: 12,
                        nightSignificantWeatherCode: 7,
                        dayMaxScreenTemperature: 17.9,
                        nightMinScreenTemperature: 12.89,
                        dayUpperBoundMaxTemp: 19.91,
                        nightUpperBoundMinTemp: 14.04,
                        dayLowerBoundMaxTemp: 16.54,
                        nightLowerBoundMinTemp: 11.26,
                        dayMaxFeelsLikeTemp: 16.16,
                        nightMinFeelsLikeTemp: 11.3,
                        dayUpperBoundMaxFeelsLikeTemp: 18.73,
                        nightUpperBoundMinFeelsLikeTemp: 12.36,
                        dayLowerBoundMaxFeelsLikeTemp: 15.84,
                        nightLowerBoundMinFeelsLikeTemp: 9.49,
                        dayProbabilityOfPrecipitation: 87,
                        nightProbabilityOfPrecipitation: 8,
                        dayProbabilityOfSnow: 0,
                        nightProbabilityOfSnow: 0,
                        dayProbabilityOfHeavySnow: 0,
                        nightProbabilityOfHeavySnow: 0,
                        dayProbabilityOfRain: 87,
                        nightProbabilityOfRain: 8,
                        dayProbabilityOfHeavyRain: 83,
                        nightProbabilityOfHeavyRain: 3,
                        dayProbabilityOfHail: 16,
                        nightProbabilityOfHail: 0,
                        dayProbabilityOfSferics: 15,
                        nightProbabilityOfSferics: 1,
                    },
                ],
            },
        },
    ],
};

export const steamContent = {
    game: {
        gameName: "Video Game Name",
        gameVersion: "1",
        availableGameStats: {
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
            stats: [{ name: "version", defaultvalue: 0, displayName: "" }],
        },
    },
};

export const steamUserContent = {
    playerstats: {
        steamID: "SteamUserID",
        gameName: "Video Game Name",
        achievements: [{ apiname: "1", achieved: 1, unlocktime: 1657572168 }],
        success: true,
    },
};
