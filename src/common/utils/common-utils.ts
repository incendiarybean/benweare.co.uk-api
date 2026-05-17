import type {
    FetchArticleOutput, NewsArticle
} from '../types.ts';
import type { HttpStatusCode } from 'axios';
import { IO } from '../../server/index.ts';
import {
    JSDOM, VirtualConsole
} from 'jsdom';
import axios from 'axios';
import { storage } from '../../index.ts';
import type { Response } from 'express';
import { StorageError } from './storage-utils.ts';

/**
 * A generic error function to handle an error and status code.
 */
class ServerError extends Error{
    public statusCode: number;

    constructor(
        message: string, statusCode: HttpStatusCode
    ) {
        super(
            message
        );

        this.statusCode = statusCode;
    }
}

/**
 * This function is wrapped in a setImmediate to schedule execution
 * This will trigger at the end of the current event loop to ensure other processing is complete.
 * See: https://nodejs.org/en/docs/guides/timers-in-node/
 * @param {number} timer - Number of milliseconds before refresh.
 * @param {function} trigger - Function to trigger on refresh.
 * @param {string} functionName - Name of function being refreshed.
 */
function staticRefresher(
    timer: number, trigger: () => void
): void {
    setImmediate(
        (): void => {
            console.info(
                `[${new Date}] Initialising ${trigger.name} Refresher...`
            );

            trigger();
            setInterval(
                (): void => {
                    trigger();
                }, timer
            );
        }
    );
}

/**
 * This utility is for catching failures in a function.
 * It will retry for a specified number of times.
 * @param {function} fn - A function you want to retry after failure.
 * @param {number} tries - The maximum tries before stopping.
 * @param {number} counter - The current counter for tries, do not supply this.
 */
function retryHandler(
    fn: () => Promise<void>,
    tries: number,
    counter?: number
): void {
    fn().catch(
        (
            e
        ) => {
            if (tries === 1) {
                return console.error(
                    `Function: ${fn.name} failed... (Tried ${counter} times).`
                );
            }
            console.debug(
                e
            );
            console.error(
                `Function: ${fn.name} failed... Retrying.`
            );

            return retryHandler(
                fn, tries - 1, counter ?? tries
            );
        }
    );
}

/**
 * This function retrieves a container element using containerSelector
 * It then splits the container element into children[] using splitSelector
 * @param {string} name - Name of the collected site
 * @param {string} url - URL of the site you wish to fetch from
 * @param {string} containerSelector - QuerySelector you wish to grab articles from
 * @param {string} splitSelector - QuerySelector used to identify and split each article
 * @returns {FetchArticleOutput} - An object containing the sitename and a collection of elements divided by your above selection
 */
async function fetchArticles (
    name: string,
    url: string,
    containerSelector: string,
    splitSelector: string
): Promise<FetchArticleOutput>{
    const { data } = await axios.get(
        url, { responseType: 'text' }
    );

    // Create a virtual console to silence CSS parsing errors
    const virtualConsole = new VirtualConsole;

    virtualConsole.on(
        'error', () => {
        }
    );

    const { document } = new JSDOM(
        data, { virtualConsole }
    ).
        window;
    const HTMLArticles: Element[] = [];

    document.
        querySelectorAll(
            containerSelector
        ).
        forEach(
            (
                container: Element
            ) => container.
                querySelectorAll(
                    splitSelector
                ).
                forEach(
                    (
                        article: Element
                    ) => {
                        if (article.textContent) {
                            HTMLArticles.push(
                                article
                            );
                        }
                    }
                )
        );

    return {
        outlet: name,
        unformattedArticles: HTMLArticles
    };
}

/**
 * This function runs each article through a manipulator to get the specific keys of information to save to the storage.
 * @param {FetchArticleOutput} articleData - The output from the fetchArticles function
 * @param {(articles: NewsArticle[], element: Element) => void} manipulator - The formatter to run each element through to create a typeof NewsArticle.
 */
function saveArticles(
    articleData: FetchArticleOutput,
    manipulator: (articles: NewsArticle[], element: Element) => void
): void {
    const site: string = articleData.outlet;
    const articles: NewsArticle[] = [];

    articleData.unformattedArticles.forEach(
        (
            element
        ) => manipulator(
            articles, element
        )
    );

    storage.write(
        'NEWS', site, `${site}'s Latest News.`, articles
    );
    IO.local.emit(
        'RELOAD_NEWS'
    );
}

/**
 * This function retrieves the body of the provided page
 * @param {string} url - URL of the site you wish to fetch from
 * @returns {string[]} - An array of string table rows
 */
async function fetchWikiBody(
    url: string
): Promise<string[]> {
    const { data } = await axios.get(
        url, { responseType: 'text' }
    );
    const { document } = new JSDOM(
        data
    ).window;

    const tables = document.querySelectorAll(
        '[data-description="Achievements"]'
    );

    const wikiArticles: string[] = [];

    tables.forEach(
        (
            table
        ) => {
            const rows = table.querySelectorAll(
                'tr'
            );

            rows.forEach(
                (
                    row
                ) => {
                    wikiArticles.push(
                        row.innerHTML.replaceAll(
                            /\n/g, ''
                        )
                    );
                }
            );
        }
    );

    return wikiArticles;
}

/**
 * This function scrapes a WIKI page depending on ID provided.
 * @param {string} gameId - SteamID of game
 * @returns {string } - Webpage Document
 */
async function getWikiContent(
    gameId: string
): Promise<string[] | undefined> {
    let wikiUrl;

    switch (gameId) {
        case '250900':
            wikiUrl
                = 'https://bindingofisaacrebirth.fandom.com/wiki/Achievements';
            break;
        default:
            return undefined;
    }

    const response = await fetchWikiBody(
        wikiUrl
    );

    return response;
}

/**
 * This function is used to ensure the date is parsed correctly.
 * @param {string} date - Expects date in ISO format.
 * @returns {boolean} - Returns true/false depending if it parses correctly.
 */
function dateParses(
    date: string
): boolean {
    return new Date(
        date
    ).toString() !== 'Invalid Date';
}

/**
 * This function takes a date string and tries to parse it
 * @param {string | undefined | null} date  - Expects date in ISO format.
 * @returns {string} - A date string in en-GB format
 */
function dateGenerator(
    date: string | undefined | null
): string {
    if (!date || !dateParses(
        date
    )) {
        return (new Date).toISOString();
    }

    return new Date(
        date
    ).toISOString();
}

/**
 * A function to check whether it is currently British Summer Time (GMT + 1)
 * @returns {boolean} - Whether it is currently British Summer Time
 */
function isBritishSummerTime(): boolean{
    const currentDate = new Date;

    // Get the start-date of BST
    const startOfBST = new Date(
        currentDate.getFullYear(), 3, 1
    );

    startOfBST.setDate(
        startOfBST.getDate()
        - (startOfBST.getDay() === 0
            ? 7
            : startOfBST.getDay())
    );

    // Get the end-date of BST
    const endOfBST = new Date(
        currentDate.getFullYear(), 10, 1
    );

    endOfBST.setDate(
        endOfBST.getDate() - (endOfBST.getDay() === 0
            ? 7
            : endOfBST.getDay())
    );

    return (
        currentDate.getTime() >= startOfBST.getTime()
        && currentDate.getTime() <= endOfBST.getTime()
    );
}

/**
 * A generic error handler for failed web requests.
 * @param {Response} res - The Express response object.
 * @param {unknown | ServerError | Error} error - The error instance.
 * @returns {void}
 */
function errorHandler(
    res: Response, error: unknown | ServerError | Error
): void {
    if (error instanceof ServerError || error instanceof StorageError) {
        res.status(
            error.statusCode
        ).json(
            { message: error.message }
        );
    }
    else if (error instanceof Error) {
        res.status(
            502
        ).json(
            { message: error.message }
        );
    }
    else {
        res.status(
            502
        ).json(
            { message: 'An unhandled server error has occurred.' }
        );
    }

    return;
}

export {
    ServerError, staticRefresher, retryHandler, fetchArticles, saveArticles, fetchWikiBody, getWikiContent, dateParses, dateGenerator, isBritishSummerTime, errorHandler
};
