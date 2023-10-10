import './workers/news-worker';
import './workers/weather-worker';
import './server';

import { NewsArticle, WeatherRecord } from '@common/types';
import { ObjectStorage } from '@common/utils/storage-utils';

export const storage = new ObjectStorage<NewsArticle | WeatherRecord>();
