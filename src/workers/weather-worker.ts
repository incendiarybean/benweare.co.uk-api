import type {
    WeatherConfig,
    WeatherRequestHeaders,
    WeatherTimeSeries,
} from '@common/types';
import {
    dateGenerator,
    retryHandler,
    staticRefresher,
} from '@common/utils/common-utils';
import {
    mockWeatherResponse,
    weatherCodes,
} from '@common/resources/weather-resources';

import type { AxiosResponse } from 'axios';
import { IO } from '@server';
import axios from 'axios';
import { storage } from '..';

const config: WeatherConfig = {
    method: 'GET',
    url: 'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/daily',
    qs: {
        includeLocationName: 'true',
        latitude: process.env.LATITUDE ?? '',
        longitude: process.env.LONGITUDE ?? '',
    },
    headers: {
        apikey: process.env.METOFFICE_API_TOKEN ?? '',
        accept: 'application/json',
    },
};

const fetchWeather = (
    url: string,
    headers: WeatherRequestHeaders
): Promise<AxiosResponse> =>
    axios
        .get(url, { headers })
        .then(async (response: AxiosResponse) => response);

/**
 * This function gets Weather for the given location
 * @returns {void} - Writes data to storage object
 */
export const getMetOffice = (): Promise<void> =>
    fetchWeather(
        new URL(
            `${config.url}?${new URLSearchParams(config.qs).toString()}`
        ).toString(),
        config.headers
    ).then((response) => {
        const { data } = response;
        const { features } = data;
        let series: any = [];
        if (features[0]) {
            const { timeSeries } = features[0].properties;
            timeSeries.forEach((timeSeries: WeatherTimeSeries) => {
                if (timeSeries.daySignificantWeatherCode) {
                    const [type, description] =
                        weatherCodes[timeSeries.daySignificantWeatherCode];
                    series.push({
                        maxTemp: `${Math.round(
                            timeSeries.dayMaxScreenTemperature
                        )}º`,
                        lowTemp: `${Math.round(
                            timeSeries.nightMinScreenTemperature
                        )}º`,
                        maxFeels: `${Math.round(
                            timeSeries.dayMaxFeelsLikeTemp
                        )}º`,
                        maxWindSpeed: Math.round(timeSeries.midday10MWindSpeed),
                        weather: type,
                        weatherDescription: description,
                        date: dateGenerator(timeSeries.time),
                    });
                }
            });
        }

        storage.write(
            'WEATHER',
            'MetOffice',
            `Weather in ${features[0].properties.location.name}`,
            series
        );
        IO.local.emit('RELOAD_WEATHER');
    });

export const getWeather = (): void => {
    // This is to stop overrunning MetOffice API allowances
    if (process.env.NODE_ENV === 'development') {
        console.info(`[${new Date()}] Using Development MetOffice weather...`);
        storage.write(
            'WEATHER',
            'MetOffice',
            `Weather in development`,
            mockWeatherResponse
        );
        return;
    }
    retryHandler(getMetOffice, 2);
};

staticRefresher(900000, getWeather);
