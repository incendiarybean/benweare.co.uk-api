import type {
    WeatherConfig,
    WeatherRecord,
    WeatherRequestHeaders,
    WeatherTimeSeries
} from '../common/types.ts';
import {
    dateGenerator,
    retryHandler,
    ServerError,
    staticRefresher
} from '../common/utils/common-utils.ts';
import {
    mockWeatherResponse,
    weatherCodes
} from '../common/resources/weather-resources.ts';
import type { AxiosResponse } from 'axios';
import { IO } from '../server/index.ts';
import axios from 'axios';
import { storage } from '../index.ts';

const config: WeatherConfig = {
    method: 'GET',
    url: 'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/daily',
    qs: {
        includeLocationName: 'true',
        latitude: process.env['LATITUDE'] ?? '',
        longitude: process.env['LONGITUDE'] ?? ''
    },
    headers: {
        apikey: process.env['METOFFICE_API_TOKEN'] ?? '',
        accept: 'application/json'
    }
};

function fetchWeather(
    url: string,
    headers: WeatherRequestHeaders
): Promise<AxiosResponse> {
    const response = axios.
        get(
            url, { headers }
        );

    return response;
}

/**
 * This function gets Weather for the given location
 * @returns {void} - Writes data to storage object
 */
async function getMetOffice(): Promise<void>{
    const response = await fetchWeather(
        new URL(
            `${config.url}?${new URLSearchParams(
                config.qs
            ).toString()}`
        ).toString(),
        config.headers
    );
    const { data } = response;
    const { features } = data;
    const series: WeatherRecord[] = [];

    if (features[0]) {
        const { timeSeries } = features[0].properties;

        timeSeries.forEach(
            (
                timeSeries: WeatherTimeSeries
            ) => {
                if (timeSeries.daySignificantWeatherCode) {
                    const weatherCode = weatherCodes[timeSeries.daySignificantWeatherCode];

                    if (!weatherCode) {
                        throw new ServerError(
                            `No weather found for code: ${timeSeries.daySignificantWeatherCode}.`, 404
                        );
                    }

                    const [
                        type,
                        description
                    ]
                        = weatherCode;

                    series.push(
                        {
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
                            date: dateGenerator(
                                timeSeries.time
                            )
                        }
                    );
                }
            }
        );
    }

    storage.write(
        'WEATHER',
        'MetOffice',
        `Weather in ${features[0].properties.location.name}`,
        series
    );
    IO.local.emit(
        'RELOAD_WEATHER'
    );
}

function getWeather(): void {
    // This is to stop overrunning MetOffice API allowances
    if (process.env['NODE_ENV'] === 'development') {
        console.info(
            `[${new Date}] Using Development MetOffice weather...`
        );
        storage.write(
            'WEATHER',
            'MetOffice',
            'Weather in development',
            mockWeatherResponse
        );

        return;
    }
    retryHandler(
        getMetOffice, 2
    );
}

staticRefresher(
    900000, getWeather
);

export {
    fetchWeather, getMetOffice, getWeather
};
