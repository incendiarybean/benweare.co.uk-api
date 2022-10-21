import type { AxiosResponse } from "axios";
import axios from "axios";
import { JSDOM } from "jsdom";
import type { FilterDataInput } from "@common/types";

/**
 * This function is wrapped in a setImmediate to schedule execution
 * This will trigger at the end of the current event loop to ensure other processing is complete.
 * See: https://nodejs.org/en/docs/guides/timers-in-node/
 * @param timer Number - Number of MS before refresh
 * @param trigger Function - Function to trigger on refresh
 * @param collectorName String - Name of collector
 */
export const staticRefresher = (
    timer: number,
    trigger: Function,
    collectorName: string
) =>
    setImmediate((): void => {
        console.log(`[${new Date()}] Initialising ${collectorName} Cache...`);

        trigger();
        setInterval((): void => {
            trigger();
        }, timer);
    });

/**
 * This function retrieves a container element using containerSelector
 * It then splits the container element into children[] using splitSelector
 * @param url URL of the site you wish to fetch from
 * @param containerSelector QuerySelector you wish to grab articles from
 * @param splitSelector QuerySelector used to identify and split each article
 * @returns HTMLArticles[], an array of elements depending on your above selection
 */
export const fetchArticles = (
    url: string,
    containerSelector: string,
    splitSelector: string
) =>
    new Promise<Element[]>((resolve, reject) =>
        axios
            .get(url, { responseType: "text" })
            .then((response: AxiosResponse) => {
                const { document } = new JSDOM(response.data).window;
                const HTMLArticles: Element[] = [];
                document
                    .querySelectorAll(containerSelector)
                    .forEach((container: Element) =>
                        container
                            .querySelectorAll(splitSelector)
                            .forEach((article: Element, index: number) => {
                                if (index < 9 && article.textContent) {
                                    HTMLArticles.push(article);
                                }
                            })
                    );
                return resolve(HTMLArticles);
            })
            .catch((e: any) => {
                reject(e);
            })
    );

/**
 * This function is used to ensure the user enters correct date stamp.
 * @param date String - Expects date in format "DD/MM/YYYY"
 * @returns Boolean - Returns true/false depending if it matches REGEX.
 */
export const isCorrectDateFormat = (date: string): boolean =>
    /\d{2}\/\d{2}\/\d{4}$/.test(date);

/**
 * This function is used to ensure the date is parsed correctly.
 * @param date String - Expects date in ISO format.
 * @returns Boolean - Returns true/false depending if it parses correctly.
 */
const dateParses = (date: string): boolean =>
    new Date(date).toString() === "Invalid Date";

/**
 * This function is used to split given dates into [DD, MM, YYYY]
 * @param date String - Expects date in format "DD/MM/YYYY"
 * @returns String - Returns date in form of UK formatted string.
 */
export const dateSplitter = (date: string): string => {
    const dividedDate = date.split("/");
    const YYYY = parseInt(dividedDate[2]);
    const MM = parseInt(dividedDate[1]) - 1;
    const DD = parseInt(dividedDate[0]);
    return new Date(YYYY, MM, DD).toLocaleDateString("en-UK");
};

/**
 * This function takes a date string and tries to parse it
 * @param date String | undefined | null - Expects date in ISO format.
 * @returns String - Date string in en-UK format
 */
export const dateGenerator = (date: string | undefined | null): string => {
    if (!date || !dateParses(date)) {
        return new Date().toLocaleDateString("en-UK");
    }
    return new Date(date).toLocaleDateString("en-UK");
};

/**
 * This function filters an object using optional queries and function pass in
 * @param data FilterDataInput[] - An array of any kind of object
 * @param key string - The key to find in the filtered object
 * @param query string - The string to compare against the object[key]
 * @param operation Function - Optional function to manipulate the object[key]
 * @returns FilterDataInput[] - An array of objects that match query
 */
export const dataFilter = (
    data: FilterDataInput[],
    key: string,
    query: string,
    operation?: Function
): FilterDataInput[] =>
    data.filter(
        (item: any) =>
            (operation ? operation(item["key"]) : item[key].toLowerCase()) ===
            query.toLocaleLowerCase()
    );
