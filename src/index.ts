import { NewsArticle, WeatherRecord } from "@common/types";
import { ObjectStorage } from "@common/utils/storage-utils";
export const storage = new ObjectStorage<NewsArticle | WeatherRecord>();

import "./workers/news-worker";
import "./workers/weather-worker";

import "./server";
