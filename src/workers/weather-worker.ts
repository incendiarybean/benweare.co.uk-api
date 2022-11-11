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
import { ObjectStorage } from "@common/utils/storage-utils";
import { IO } from "@server";

/*--------------*/
/*    CONFIG    */
/*--------------*/

const { NODE_ENV } = process.env;
const service = "Weather";
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
    const site: string = "MetOffice";
    const url = new URL(
        `${config.url}?${new URLSearchParams(config.qs).toString()}`
    ).toString();

    if ([undefined, "test", "development"].includes(NODE_ENV)) {
        return storage.write(
            site,
            mockWeatherResponse,
            `Weather in development`
        );
    }

    fetchWeather(url, config.headers)
        .then((response) => {
            const { data } = response;
            const { features } = data;
            let series = [];
            if (features) {
                series = features[0].properties.timeSeries.map(
                    (timeSeries: WeatherTimeSeries) => {
                        const [type, description] =
                            weatherCodes[
                                timeSeries.daySignificantWeatherCode || 1
                            ];

                        return {
                            maxTemp: `${Math.round(
                                timeSeries.dayMaxScreenTemperature
                            )}º`,
                            lowTemp: `${Math.round(
                                timeSeries.nightMinScreenTemperature
                            )}º`,
                            maxFeels: `${Math.round(
                                timeSeries.dayMaxFeelsLikeTemp
                            )}º`,
                            maxWindSpeed: Math.round(
                                timeSeries.midday10MWindSpeed
                            ),
                            weather: type,
                            weatherDescription: description,
                        };
                    }
                );
            }

            storage.write(
                site,
                series,
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

staticRefresher(900000, getWeather, service);
