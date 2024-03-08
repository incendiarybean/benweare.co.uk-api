import type { AxiosResponse } from 'axios';
import { JSDOM } from 'jsdom';
import axios from 'axios';

/**
 * This function is wrapped in a setImmediate to schedule execution
 * This will trigger at the end of the current event loop to ensure other processing is complete.
 * See: https://nodejs.org/en/docs/guides/timers-in-node/
 * @param {number} timer - Number of milliseconds before refresh.
 * @param {function} trigger - Function to trigger on refresh.
 * @param {string} functionName - Name of function being refreshed.
 */
export const staticRefresher = (
    timer: number,
    trigger: () => void,
    functionName: string
): void => {
    setImmediate((): void => {
        console.info(
            `[${new Date()}] Initialising ${functionName} Refresher...`
        );

        trigger();
        setInterval((): void => {
            trigger();
        }, timer);
    });
};

/**
 * This utility is for catching failures in a function.
 * It will retry for a specified number of times.
 * @param {function} fn - A function you want to retry after failure.
 * @param {number} tries - The maximum tries before stopping.
 * @param {number} counter - The current counter for tries, do not supply this.
 */
export const retryHandler = (
    fn: () => Promise<void>,
    tries: number,
    counter?: number
): void => {
    fn().catch((e) => {
        if (tries === 1) {
            return console.error(
                `Function: ${fn.name} failed... (Tried ${counter} times).`
            );
        }
        console.debug(e);
        console.error(`Function: ${fn.name} failed... Retrying.`);
        return retryHandler(fn, tries - 1, counter ?? tries);
    });
};

/**
 * This function retrieves a container element using containerSelector
 * It then splits the container element into children[] using splitSelector
 * @param {string} url - URL of the site you wish to fetch from
 * @param {string} containerSelector - QuerySelector you wish to grab articles from
 * @param {string} splitSelector - QuerySelector used to identify and split each article
 * @returns {Element[]} - An array of elements depending on your above selection
 */
export const fetchArticles = (
    url: string,
    containerSelector: string,
    splitSelector: string
): Promise<Element[]> =>
    axios.get(url, { responseType: 'text' }).then((response: AxiosResponse) => {
        const { document } = new JSDOM(response.data).window;
        const HTMLArticles: Element[] = [];
        document
            .querySelectorAll(containerSelector)
            .forEach((container: Element) =>
                container
                    .querySelectorAll(splitSelector)
                    .forEach((article: Element, index: number) => {
                        if (article.textContent) {
                            HTMLArticles.push(article);
                        }
                    })
            );
        return HTMLArticles;
    });

/**
 * This function retrieves the body of the provided page
 * @param {string} url - URL of the site you wish to fetch from
 * @returns {string[]} - An array of string table rows
 */
export const fetchWikiBody = (url: string) =>
    axios.get(url, { responseType: 'text' }).then((response: AxiosResponse) => {
        const { document } = new JSDOM(response.data).window;

        const tables = document.querySelectorAll(
            '[data-description="Achievements"]'
        );

        const wikiArticles: string[] = [];
        tables.forEach((table) => {
            const rows = table.querySelectorAll('tr');
            rows.forEach((row) => {
                wikiArticles.push(row.innerHTML.replaceAll(/\n/g, ''));
            });
        });
        return wikiArticles;
    });

/**
 * This function scrapes a WIKI page depending on ID provided.
 * @param {string} gameId - SteamID of game
 * @returns {string } - Webpage Document
 */
export const getWikiContent = async (
    gameId: string
): Promise<string[] | undefined> => {
    let wikiUrl;

    switch (gameId) {
        case '250900':
            wikiUrl =
                'https://bindingofisaacrebirth.fandom.com/wiki/Achievements';
            break;
        default:
            return undefined;
    }

    const response = await fetchWikiBody(wikiUrl);
    return response;
};

/**
 * This function is used to ensure the date is parsed correctly.
 * @param {string} date - Expects date in ISO format.
 * @returns {boolean} - Returns true/false depending if it parses correctly.
 */
export const dateParses = (date: string): boolean =>
    new Date(date).toString() !== 'Invalid Date';

/**
 * This function takes a date string and tries to parse it
 * @param {string | undefined | null} date  - Expects date in ISO format.
 * @returns {string} - A date string in en-UK format
 */
export const dateGenerator = (date: string | undefined | null): string => {
    if (!date || !dateParses(date)) {
        return new Date().toISOString();
    }
    return new Date(date).toISOString();
};
