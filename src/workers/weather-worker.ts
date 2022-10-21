import axios from "axios";
import type { AxiosResponse } from "axios";
import {
    mockWeatherResponse,
    weatherCodes,
} from "@common/resources/weather-resources";
import type {
    WeatherConfig,
    WeatherRequestHeaders,
    WeatherTimeSeries,
} from "@common/types";
import { staticRefresher } from "@common/utils/common-utils";
import { ObjectStorage } from "@common/utils/data-store";
import { IO } from "@server";

/*--------------*/
/*    CONFIG    */
/*--------------*/

export const storage = new ObjectStorage();

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
/* INTERACTIONS */
/*--------------*/

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
    const site: string = "PCGamer";
    const url = new URL(
        `${config.url}?${new URLSearchParams(config.qs).toString()}`
    ).toString();

    fetchWeather(url, config.headers)
        .then((response) => {
            const { data } = response;
            const { features } = data;

            if (features) {
                features[0].properties.timeSeries =
                    features[0].properties.timeSeries.map(
                        (day: WeatherTimeSeries) => {
                            const [type, description] =
                                weatherCodes[
                                    day.daySignificantWeatherCode || 1
                                ];

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
                            day.location = features[0].properties.location.name;

                            return day;
                        }
                    );
            }

            storage.write(
                site,
                features[0].properties.timeSeries,
                `Weather in ${features[0].properties.location.name}`
            );
            IO.local.emit("RELOAD_WEATHER");
        })
        .catch(() => {
            console.log(
                `[${new Date()}] Failed to fetch weather at this time.`
            );
        });
};

/*--------------*/
/*    EVENTS    */
/*--------------*/

const { NODE_ENV } = process.env;
const service = "Weather";

if (NODE_ENV === "development" || NODE_ENV === "test" || !NODE_ENV) {
    console.log(`[${new Date()}] Initialising Offline ${service} Cache...`);
    storage.write(
        "MetOffice",
        mockWeatherResponse,
        "WEATHER OUTLET DESCRIPTION"
    );
} else {
    staticRefresher(900000, getWeather, service);
}
