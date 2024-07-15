import type {
    FetchArticleOutput,
    NasaArticle,
    NewsArticle,
    UndefinedNews,
} from '@common/types';
import {
    dateGenerator,
    fetchArticles,
    retryHandler,
    saveArticles,
    staticRefresher,
} from '@common/utils/common-utils';

import axios from 'axios';
import { storage } from '..';

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getArsTechnicaNews = (): Promise<void> =>
    fetchArticles(
        'Ars_Technica',
        'https://arstechnica.com/gadgets/',
        '.listing-latest',
        '.article'
    ).then((output: FetchArticleOutput) =>
        saveArticles(output, (articles: NewsArticle[], element: Element) => {
            const title: UndefinedNews = element
                .querySelector('h2')
                ?.textContent?.trim();
            if (title) {
                const url: string =
                    element.querySelector('a')?.href ?? 'Not Found';

                const date: string = dateGenerator(
                    element.querySelector('time')?.getAttribute('datetime')
                );

                articles.push({
                    title,
                    url,
                    date,
                });
            }
        })
    );

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getNasaImage = (): Promise<void> =>
    axios
        .get(
            `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
        )
        .then(({ data }: { data: NasaArticle }) => {
            const site: string = 'NASA';

            const articles = [
                {
                    title: data.title,
                    url: data.url,
                    description: data.explanation,
                    img: data.url,
                    date: dateGenerator(data.date),
                },
            ];
            storage.write('NEWS', site, 'NASA Daily Image.', articles);
        });

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getPCGamerNews = (): Promise<void> =>
    fetchArticles(
        'PCGamer',
        'https://www.pcgamer.com/uk/news/',
        "[data-list='home/latest']",
        '.listingResult'
    ).then((output: FetchArticleOutput) =>
        saveArticles(output, (articles: NewsArticle[], element: Element) => {
            const title: UndefinedNews = element
                .querySelector('.article-name')
                ?.textContent?.trim();
            if (title) {
                const url: string =
                    element.querySelector('a')?.href ?? 'Not Found';

                const img: string =
                    element
                        .querySelector('.article-lead-image-wrap')
                        ?.getAttribute('data-original') ?? 'Not Found';

                const date: string = dateGenerator(
                    element
                        .querySelector('.relative-date')
                        ?.getAttribute('datetime')
                );

                articles.push({
                    title,
                    url,
                    img,
                    date,
                });
            }
        })
    );

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getRPSNews = (): Promise<void> =>
    fetchArticles(
        'Rock_Paper_Shotgun',
        'https://www.rockpapershotgun.com/latest',
        '.articles',
        'li'
    ).then((output: FetchArticleOutput) =>
        saveArticles(output, (articles: NewsArticle[], element: Element) => {
            const title: UndefinedNews = element
                .querySelector('.title')
                ?.children[0].textContent?.trim();
            if (title) {
                const url: string =
                    element.querySelector('a')?.href ?? 'Not Found';

                const img: string =
                    element
                        .querySelector('.thumbnail_image')
                        ?.getAttribute('src') ?? 'Not Found';

                const date: string = dateGenerator(
                    element.querySelector('time')?.getAttribute('datetime')
                );

                articles.push({
                    title,
                    url,
                    img,
                    date,
                });
            }
        })
    );

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getRegisterNews = (): Promise<void> =>
    fetchArticles(
        'The_Register',
        'https://www.theregister.com/security',
        '#main-col',
        'article'
    ).then((output: FetchArticleOutput) =>
        saveArticles(output, (articles: NewsArticle[], element: Element) => {
            const title: UndefinedNews = element
                .querySelector('h4')
                ?.textContent?.trim();
            if (title) {
                const url: string = element.querySelector('a')?.href
                    ? `https://www.theregister.com${
                          element.querySelector('a')?.href
                      }`
                    : 'Not Found';
                const epoch: string | null | undefined = element
                    .querySelector('.time_stamp')
                    ?.getAttribute('data-epoch');

                if (epoch) {
                    const epochDate = new Date(0);
                    epochDate.setUTCSeconds(parseInt(epoch, 10));
                    const date: string = dateGenerator(epochDate.toISOString());
                    articles.push({
                        title,
                        url,
                        date,
                    });
                }
            }
        })
    );

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getUKNews = (): Promise<void> =>
    fetchArticles(
        'BBC',
        'https://www.bbc.co.uk/news/england',
        '[role="list"]',
        '[type="article"]'
    ).then((output: FetchArticleOutput) =>
        saveArticles(output, (articles: NewsArticle[], element: Element) => {
            // Latest News articles have a hidden span reporting the publishing time
            // We only want latest articles, so only get Articles that have a second child element
            const title: string | undefined =
                element.querySelector('[role="text"]')?.childNodes[1]
                    ?.textContent ?? undefined;
            if (title) {
                let img: UndefinedNews =
                    element.querySelector('img')?.src ?? 'Not Found';

                let url: string =
                    element.querySelector('a')?.href ?? 'Not Found';

                if (!url.includes('Not Found') && !url.includes('https://')) {
                    url = `https://www.bbc.co.uk${url}`;
                }

                const publishedTime: UndefinedNews =
                    element.querySelector('h3')?.firstChild?.textContent;

                // Assuming Latest News only has today's news (most probably)
                // Parse the published date (e.g 12:00) to today's date/time
                let date = new Date();
                if (publishedTime?.match(/\d{1,2}:\d{1,2}/g)) {
                    const [hour, minute] = publishedTime.split(':');
                    const [currentHour, currentMinute] = date
                        .toLocaleTimeString('en-UK')
                        .split(':');

                    // If the article published hour/minute is ahead of current time, assume it was from yesterday
                    if (parseInt(hour) >= parseInt(currentHour)) {
                        if (parseInt(minute) > parseInt(currentMinute)) {
                            date.setDate(date.getDate() - 1);
                        }
                    }

                    date.setHours(parseInt(hour), parseInt(minute));
                }

                articles.push({
                    title,
                    url,
                    img,
                    date: date.toISOString(),
                });
            }
        })
    );

export const getNews = (): void => {
    retryHandler(getArsTechnicaNews, 5);
    retryHandler(getNasaImage, 5);
    retryHandler(getPCGamerNews, 5);
    retryHandler(getRPSNews, 5);
    retryHandler(getRegisterNews, 5);
    retryHandler(getUKNews, 5);
};

staticRefresher(240000, getNews);
