import 'dotenv/config';

import './workers/news-worker.ts';
import './workers/weather-worker.ts';
import './server/index.ts';
import type {
    NewsArticle, WeatherRecord
} from './common/types.ts';
import { ObjectStorage } from './common/utils/storage-utils.ts';

export const storage = new ObjectStorage<NewsArticle | WeatherRecord>;
