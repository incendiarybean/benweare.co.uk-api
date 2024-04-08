import type { NasaArticle, NewsArticle, UndefinedNews } from '@common/types';
import {
    dateGenerator,
    fetchArticles,
    retryHandler,
    staticRefresher,
} from '@common/utils/common-utils';

import { IO } from '@server';
import axios from 'axios';
import { storage } from '..';

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getRegisterNews = (): Promise<void> =>
    fetchArticles(
        'https://www.theregister.com/security',
        '#main-col',
        'article'
    ).then((HTMLArticles: Element[]) => {
        const site: string = 'The_Register';
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews =
                HTMLDivElement.querySelector('h4')?.textContent?.trim();
            if (title) {
                const url: string = HTMLDivElement.querySelector('a')?.href
                    ? `https://www.theregister.com${
                          HTMLDivElement.querySelector('a')?.href
                      }`
                    : 'Not Found';

                const epoch: string =
                    HTMLDivElement.querySelector('.time_stamp')?.getAttribute(
                        'data-epoch'
                    ) ?? '0';

                const epochDate = new Date(0);
                epochDate.setUTCSeconds(parseInt(epoch, 10));

                const date: string = dateGenerator(epochDate.toISOString());

                articles.push({
                    title,
                    url,
                    date,
                });
            }
        });
        storage.write('NEWS', site, `${site}'s Latest News.`, articles);
        IO.local.emit('RELOAD_NEWS');
    });

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getRPSNews = (): Promise<void> =>
    fetchArticles(
        'https://www.rockpapershotgun.com/latest',
        '.articles',
        'li'
    ).then((HTMLArticles: Element[]) => {
        const site: string = 'Rock_Paper_Shotgun';
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews =
                HTMLDivElement.querySelector(
                    '.title'
                )?.children[0].textContent?.trim();
            if (title) {
                const url: string =
                    HTMLDivElement.querySelector('a')?.href ?? 'Not Found';

                const img: string =
                    HTMLDivElement.querySelector(
                        '.thumbnail_image'
                    )?.getAttribute('src') ?? 'Not Found';

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector('time')?.getAttribute(
                        'datetime'
                    )
                );

                articles.push({
                    title,
                    url,
                    img,
                    date,
                });
            }
        });
        storage.write('NEWS', site, `${site}'s Latest News.`, articles);
        IO.local.emit('RELOAD_NEWS');
    });

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getPCGamerNews = (): Promise<void> =>
    fetchArticles(
        'https://www.pcgamer.com/uk/news/',
        "[data-list='home/latest']",
        '.listingResult'
    ).then((HTMLArticles: Element[]) => {
        const site: string = 'PCGamer';
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews =
                HTMLDivElement.querySelector(
                    '.article-name'
                )?.textContent?.trim();
            if (title) {
                const url: string =
                    HTMLDivElement.querySelector('a')?.href ?? 'Not Found';

                const img: string =
                    HTMLDivElement.querySelector(
                        '.article-lead-image-wrap'
                    )?.getAttribute('data-original') ?? 'Not Found';

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector(
                        '.relative-date'
                    )?.getAttribute('datetime')
                );

                articles.push({
                    title,
                    url,
                    img,
                    date,
                });
            }
        });
        storage.write('NEWS', site, `${site}'s Latest News.`, articles);
        IO.local.emit('RELOAD_NEWS');
    });

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getUKNews = (): Promise<void> =>
    fetchArticles(
        'https://www.bbc.co.uk/news/england',
        '[role="list"]',
        '[type="article"]'
    ).then((HTMLArticles: Element[]) => {
        const site: string = 'BBC';
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            // Latest News articles have a hidden span reporting the publishing time
            // We only want latest articles, so only get Articles that have a second child element
            const title: string | undefined =
                HTMLDivElement.querySelector('[role="text"]')?.childNodes[1]
                    ?.textContent ?? undefined;
            if (title) {
                let img: UndefinedNews =
                    HTMLDivElement.querySelector('img')?.src ?? 'Not Found';

                let url: string =
                    HTMLDivElement.querySelector('a')?.href ?? 'Not Found';

                if (!url.includes('Not Found') && !url.includes('https://')) {
                    url = `https://www.bbc.co.uk${url}`;
                }

                const publishedTime: UndefinedNews =
                    HTMLDivElement.querySelector('h3')?.firstChild?.textContent;

                // Assuming Latest News only has today's news (most probably)
                // Parse the published date (e.g 12:00) to today's date/time
                let date = new Date();
                if (publishedTime?.match(/\d{1,2}:\d{1,2}/g)) {
                    const [hours, minutes] = publishedTime.split(':');
                    date.setHours(parseInt(hours), parseInt(minutes));
                }

                articles.push({
                    title,
                    url,
                    img,
                    date: date.toISOString(),
                });
            }
        });
        storage.write('NEWS', site, `${site}'s Latest News.`, articles);
        IO.local.emit('RELOAD_NEWS');
    });

/**
 * This function gets news for the given outlet
 * @returns {void} - Writes data to storage object
 */
export const getArsTechnica = (): Promise<void> =>
    fetchArticles(
        'https://arstechnica.com/gadgets/',
        '.listing-latest',
        '.article'
    ).then((HTMLArticles: Element[]) => {
        const site: string = 'Ars_Technica';
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews =
                HTMLDivElement.querySelector('h2')?.textContent?.trim();
            if (title) {
                const url: string =
                    HTMLDivElement.querySelector('a')?.href ?? 'Not Found';

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector('time')?.getAttribute(
                        'datetime'
                    )
                );

                articles.push({
                    title,
                    url,
                    date,
                });
            }
        });
        storage.write('NEWS', site, `${site}'s Latest News.`, articles);
        IO.local.emit('RELOAD_NEWS');
    });

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

export const getNews = (): void => {
    retryHandler(getPCGamerNews, 5);
    retryHandler(getRPSNews, 5);
    retryHandler(getRegisterNews, 5);
    retryHandler(getArsTechnica, 5);
    retryHandler(getUKNews, 5);
    retryHandler(getNasaImage, 5);
};

staticRefresher(480000, getNews, 'News');
