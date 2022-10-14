import { AxiosRequestHeaders } from "axios";
import { CacheType, CommandInteractionOption } from "discord.js";

/* TYPES FOR SERVER */

export interface NewsArticle {
    title: string;
    link: string;
    img: string;
    date: string;
    site: string;
}

export interface NasaArticle {
    copyright: string;
    date: string;
    explanation: string;
    hdurl: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
    site: string;
}

export interface WeatherFeatures {
    type: string;
    geometry: { type: string; coordinates: number[] };
    properties: {
        location: { name: string };
        requestPointDistance: number;
        modelRunDate: string;
        timeSeries: WeatherTimeSeries[];
    };
}

export interface WeatherTimeSeries {
    time: string;
    Description: string;
    WeatherType: string;
    MaxTemp: string;
    LowTemp: string;
    MaxFeels: string;
    Wind: number;
    dayLowerBoundMaxFeelsLikeTemp: number;
    dayLowerBoundMaxTemp: number;
    dayMaxFeelsLikeTemp: number;
    dayMaxScreenTemperature: number;
    dayProbabilityOfHail: number;
    dayProbabilityOfHeavyRain: number;
    dayProbabilityOfHeavySnow: number;
    dayProbabilityOfPrecipitation: number;
    dayProbabilityOfRain: number;
    dayProbabilityOfSferics: number;
    dayProbabilityOfSnow: number;
    daySignificantWeatherCode: number;
    dayUpperBoundMaxFeelsLikeTemp: number;
    dayUpperBoundMaxTemp: number;
    maxUvIndex: number;
    midday10MWindDirection: number;
    midday10MWindGust: number;
    midday10MWindSpeed: number;
    middayMslp: number;
    middayRelativeHumidity: number;
    middayVisibility: number;
    midnight10MWindDirection: number;
    midnight10MWindGust: number;
    midnight10MWindSpeed: number;
    midnightMslp: number;
    midnightRelativeHumidity: number;
    midnightVisibility: number;
    nightLowerBoundMinFeelsLikeTemp: number;
    nightLowerBoundMinTemp: number;
    nightMinFeelsLikeTemp: number;
    nightMinScreenTemperature: number;
    nightProbabilityOfHail: number;
    nightProbabilityOfHeavyRain: number;
    nightProbabilityOfHeavySnow: number;
    nightProbabilityOfPrecipitation: number;
    nightProbabilityOfRain: number;
    nightProbabilityOfSferics: number;
    nightProbabilityOfSnow: number;
    nightSignificantWeatherCode: number;
    nightUpperBoundMinFeelsLikeTemp: number;
    nightUpperBoundMinTemp: number;
}

export interface WeatherParam {
    [key: string]: {
        type: string;
        description: string;
        unit: {
            label: string;
            symbol: {
                value: string;
                type: string;
            };
        };
    };
}

export interface WeatherResponse {
    location: string;
    timeseries: WeatherTimeSeries[];
    type?: string;
    features?: WeatherFeatures[];
    parameters?: WeatherParam[];
}

export interface WeatherAxiosResponse {
    status: string;
    httpMessage: string;
    data: WeatherResponse;
}

export interface WeatherStorage {
    timestamp: string | null;
    data: {
        timeseries: WeatherTimeSeries[] | null;
        location: string | null;
    };
}

export interface WeatherConfig {
    method: string;
    url: string;
    qs: {
        [key: string]: string;
    };
    headers: WeatherRequestHeaders;
}

export interface NewsResponse {
    nasa: NasaArticle;
    pc: NewsArticle[];
    bbc: NewsArticle[];
}

export interface NewsStorage {
    timestamp: string | null;
    data: {
        bbc: NewsArticle[] | null;
        pc: NewsArticle[] | null;
        nasa: NasaArticle | null;
    };
}

export type DiscordUsernameOptions =
    | {
          user: {
              id: string;
              bot: boolean;
              system: boolean;
              username: string;
              discriminator: string;
              avatar: string;
              banner: undefined | string;
              accentColor: undefined | string;
          };
      } & CommandInteractionOption<CacheType>;

export type WeatherRequestHeaders = {
    "x-ibm-client-id": string;
    "x-ibm-client-secret": string;
    accept: string;
} & AxiosRequestHeaders;
