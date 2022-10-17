import axios from "axios";
import type { AxiosResponse } from "axios";
import { MOCK_WEATHER_RESPONSE } from "@common/data/weather";
import {
    WeatherConfig,
    WeatherRequestHeaders,
    WeatherResponse,
    WeatherStorage,
    WeatherTimeSeries,
} from "@common/types";
import { IO } from "@server";

/*--------------*/
/*    CONFIG    */
/*--------------*/

export const storage: WeatherStorage = {
    timestamp: null,
    data: { timeseries: null, location: null },
};

const config: WeatherConfig = {
    method: "GET",
    url: "https://api-metoffice.apiconnect.ibmcloud.com/metoffice/production/v0/forecasts/point/daily",
    qs: {
        includeLocationName: "true",
        latitude: process.env.LATITUDE || "",
        longitude: process.env.LONGITUDE || "",
    },
    headers: {
        "x-ibm-client-id": process.env.MET_CLIENT_ID || "",
        "x-ibm-client-secret": process.env.MET_API_SECRET || "",
        accept: "application/json",
    },
};

/*--------------*/
/*    EVENTS    */
/*--------------*/

setTimeout(() => {
    console.log(`[${new Date()}] Initialising Weather Cache...`);

    if (process.env.NODE_ENV !== "production") {
        console.log(`[${new Date()}] Mock Weather Used...`);
        storage.data = MOCK_WEATHER_RESPONSE as WeatherResponse;
        return;
    }

    getWeather();
    setInterval(() => {
        getWeather();
    }, 900000);
}, 0);

/*--------------*/
/* INTERACTIONS */
/*--------------*/

const weatherCode = (code: number) => {
    switch (code) {
        case 0:
            return ["sun", "Clear night"];
        case 1:
            return ["sun", "Sunny day"];
        case 2:
            return ["cloud", "Partly cloudy (night)"];
        case 3:
            return ["cloud", "Partly cloudy (day)"];
        case 5:
            return ["foggy", "Mist"];
        case 6:
            return ["foggy", "Fog"];
        case 7:
            return ["cloud", "Cloudy"];
        case 8:
            return ["cloud", "Overcast"];
        case 9:
            return ["rain", "Light rain shower (night)"];
        case 10:
            return ["rain", "Light rain shower (day)"];
        case 11:
            return ["rain", "Drizzle"];
        case 12:
            return ["rain", "Light rain"];
        case 13:
            return ["rain", "Heavy rain shower (night)"];
        case 14:
            return ["rain", "Heavy rain shower (day)"];
        case 15:
            return ["rain", "Heavy rain"];
        case 16:
            return ["snow", "Sleet shower (night)"];
        case 17:
            return ["snow", "Sleet shower (day)"];
        case 18:
            return ["snow", "Sleet"];
        case 19:
            return ["snow", "Hail shower (night)"];
        case 20:
            return ["snow", "Hail shower (day)"];
        case 21:
            return ["snow", "Hail"];
        case 22:
            return ["snow", "Light snow shower (night)"];
        case 23:
            return ["snow", "Light snow shower (day)"];
        case 24:
            return ["snow", "Light snow"];
        case 25:
            return ["snow", "Heavy snow shower (night)"];
        case 26:
            return ["snow", "Heavy snow shower (day)"];
        case 27:
            return ["snow", "Heavy snow"];
        case 28:
            return ["thunder", "Thunder shower (night)"];
        case 29:
            return ["thunder", "Thunder shower (day)"];
        case 30:
            return ["thunder", "Thunder"];
        default:
            return ["", ""];
    }
};

const fetchWeather = (url: string, headers: WeatherRequestHeaders) =>
    new Promise<AxiosResponse>((resolve, reject) =>
        axios
            .get(url, { headers })
            .then((response: AxiosResponse) => {
                return resolve(response);
            })
            .catch((e: any) => {
                reject(e);
            })
    );

export const getWeather = () => {
    const url = new URL(
        `${config.url}?${new URLSearchParams(config.qs).toString()}`
    ).toString();

    fetchWeather(url, config.headers)
        .then((response) => {
            const { data } = response;
            const { features } = data;

            if (features) {
                features[0].properties.timeSeries =
                    features[0].properties.timeSeries.map((day: any) => {
                        const [type, description] = weatherCode(
                            day.daySignificantWeatherCode || 1
                        );

                        day.MaxTemp = `${Math.round(
                            day.dayMaxScreenTemperature
                        )}º`;
                        day.LowTemp = `${Math.round(
                            day.nightMinScreenTemperature
                        )}º`;
                        day.MaxFeels = `${Math.round(
                            day.dayMaxFeelsLikeTemp
                        )}º`;
                        day.Wind = Math.round(day.midnight10MWindGust);

                        day.WeatherType = type;
                        day.Description = description;
                        return day;
                    });

                data.location = features[0].properties.location.name;
                data.timeseries = features[0].properties.timeSeries;
                delete data.type;
                delete data.features;
                delete data.parameters;
            }

            storage.data = data;
            storage.timestamp = new Date().toISOString();
            IO.local.emit("RELOAD_WEATHER");
        })
        .catch(() => {
            console.log(
                `[${new Date()}] Failed to fetch weather at this time.`
            );
        });
};

export const isCorrectDateFormat = (date: string) =>
    date.match(/\d{4}-\d{2}-\d{2}/);

export const getDayByDate = (date: string, timeseries: WeatherTimeSeries[]) =>
    timeseries.filter(
        (day: WeatherTimeSeries) =>
            new Date(day.time).toISOString() === new Date(date).toISOString()
    );
