import type { AxiosRequestHeaders } from "axios";
import type {
    CacheType,
    CommandInteractionOption,
    Guild,
    GuildMember,
} from "discord.js";
import type { AudioPlayer, VoiceConnection } from "@discordjs/voice";

/* GLOBAL TYPES */
export interface DataStorage {
    name: string;
    updated: Date;
    description: string;
    items: WeatherTimeSeries[] | NewsArticle[];
}

export interface FilterDataInput {
    [key: string]: any;
}

/* NEWS TYPES */
export type UndefinedNews = string | null | undefined;

export interface NewsArticle {
    title: string;
    url: string;
    description?: string;
    img: string;
    date: string;
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
}

/* WEATHER TYPES */
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
    location: string;
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

export interface WeatherConfig {
    method: string;
    url: string;
    qs: {
        [key: string]: string;
    };
    headers: WeatherRequestHeaders;
}

export type WeatherRequestHeaders = {
    "x-ibm-client-id": string;
    "x-ibm-client-secret": string;
    accept: string;
} & AxiosRequestHeaders;

export interface WeatherCodes {
    [index: number]: string[];
}

/* DISCORD TYPES */
export interface CheckDiscordVoiceTarget {
    targetUser: GuildMember;
    targetVoiceChannel: string;
    guild: Guild;
}

export interface CreateDiscordPlayer {
    connection: VoiceConnection;
    player: AudioPlayer;
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
