import type { AxiosResponse } from "axios";
import axios from "axios";
import { JSDOM } from "jsdom";
import { NewsArticle, NewsStorage } from "@lib/types";
import { MOCK_NEWS_RESPONSE } from "@resources/data/news";
import { IO } from "../..";

/*--------------*/
/*    CONFIG    */
/*--------------*/

let pcRetryCount = 0;
let ukRetryCount = 0;
let nasaRetryCount = 0;

export const storage: NewsStorage = {
    timestamp: null,
    data: {
        pc: null,
        bbc: null,
        nasa: null,
    },
};

/*--------------*/
/*    EVENTS    */
/*--------------*/

setTimeout(() => {
    console.log(`[${new Date()}] Initialising News Cache...`);

    if (process.env.NODE_ENV === "test") {
        console.log(`[${new Date()}] Mock News Used...`);
        storage.data = MOCK_NEWS_RESPONSE;
        return;
    }

    getNews();
    setInterval(() => {
        getNews();
    }, 480000);
}, 0);

/*--------------*/
/* INTERACTIONS */
/*--------------*/

export const getNews = () => {
    getPCNews();
    getUKNews();
    getNasaImage();
    storage.timestamp = new Date().toISOString();
};

const generateDate = (date: string | undefined | null) => {
    const newDate = date ? new Date(date) : new Date();

    if (newDate.toString() === "Invalid Date") {
        return new Date().toLocaleDateString("en-UK");
    }
    return newDate.toLocaleDateString("en-UK");
};

/**
 *
 * @param url URL of the site you wish to fetch from
 * @param containerSelector QuerySelector you wish to grab articles from
 * @param splitSelector QuerySelector used to identify and split each article
 * @returns HTMLArticles[], an array of elements depending on your above selection
 */
const fetchArticles = (
    url: string,
    containerSelector: string,
    splitSelector: string
) =>
    new Promise<HTMLElement[]>((resolve, reject) =>
        axios
            .get(url, { responseType: "text" })
            .then((response: AxiosResponse) => {
                const { document } = new JSDOM(response.data).window;
                const HTMLArticles: HTMLElement[] = [];
                Array.prototype.slice
                    .call(document.querySelectorAll(containerSelector))
                    .forEach((container) =>
                        Array.prototype.slice
                            .call(container.querySelectorAll(splitSelector))
                            .forEach((article, index) => {
                                if (index < 9 || !article.textContent) {
                                    return null;
                                }
                                return HTMLArticles.push(article);
                            })
                    );
                return resolve(HTMLArticles);
            })
            .catch((e: any) => {
                reject(e);
            })
    );

const getPCNews = () =>
    fetchArticles(
        "https://www.pcgamer.com/uk/",
        ".list-text-links-trending-panel",
        ".listingResult"
    )
        .then((HTMLArticles: HTMLElement[]) => {
            const Articles: NewsArticle[] = [];
            HTMLArticles.forEach((HTMLDivElement) => {
                const title: string =
                    HTMLDivElement.querySelector(".article-name")
                        ?.textContent || "Not Found";

                const link: string =
                    HTMLDivElement.querySelector("a")?.href || "Not Found";

                const img: string =
                    HTMLDivElement.querySelector(
                        ".article-lead-image-wrap"
                    )?.getAttribute("data-original") || "Not Found";

                const date: string = generateDate(
                    HTMLDivElement.querySelector(
                        ".relative-date"
                    )?.getAttribute("datetime")
                );

                const site: string = "PCGamer";

                Articles.push({
                    title,
                    link,
                    img,
                    date,
                    site,
                });
            });
            pcRetryCount = 0;
            storage.data.pc = Articles;
            IO.local.emit("RELOAD_NEWS");
        })
        .catch(() => {
            pcRetryCount += 1;
            console.log(`Failed to get PC News... Retrying.`);
            if (pcRetryCount > 5) {
                return console.log(`Failed to get PC News... (Tried 5 times).`);
            }
            getPCNews();
        });

const getUKNews: any = () =>
    fetchArticles(
        "https://www.bbc.co.uk/news/england",
        "#topos-component",
        ".gs-t-News"
    )
        .then((HTMLArticles: HTMLElement[]) => {
            const Articles: NewsArticle[] = [];
            const ArticleTitles: string[] = [];
            HTMLArticles.forEach((HTMLDivElement) => {
                let imgUrl: string | undefined | null =
                    HTMLDivElement.querySelector("img")?.getAttribute(
                        "data-src"
                    );

                if (imgUrl) {
                    imgUrl = imgUrl.replace(/\{width}/g, "720");
                } else {
                    imgUrl =
                        HTMLDivElement.querySelector("img")?.src || "Not Found";
                }

                const img = imgUrl;

                const title: string =
                    HTMLDivElement.querySelector(".gs-c-promo-heading__title")
                        ?.textContent || "Not Found";

                const link: string =
                    `https://bbc.co.uk${
                        HTMLDivElement.querySelector("a")?.href
                    }` || "Not Found";

                const date: string = generateDate(
                    HTMLDivElement.querySelector("time")?.getAttribute(
                        "datetime"
                    )
                );

                const site = "BBC";

                const live =
                    HTMLDivElement.querySelector("a")?.href.split("/")[2] ||
                    "Not Found";

                if (!ArticleTitles.includes(title) && live !== "live") {
                    ArticleTitles.push(title);
                    Articles.push({
                        title,
                        link,
                        img,
                        date,
                        site,
                    });
                }
            });
            ukRetryCount = 0;
            storage.data.bbc = Articles;
            IO.local.emit("RELOAD_NEWS");
        })
        .catch(() => {
            ukRetryCount += 1;
            console.log(`Failed to get UK News... Retrying.`);
            if (ukRetryCount < 5) {
                return console.log(`Failed to get UK News... (Tried 5 times).`);
            }
            return getUKNews();
        });

const getNasaImage = () => {
    if (process.env.NASA_API_KEY) {
        axios
            .get(
                `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
            )
            .then((response: AxiosResponse) => {
                const { data } = response;
                data.date = generateDate(response.data.date);
                data.site = "NASA";
                storage.data.nasa = response.data;
            })
            .catch(() => {
                nasaRetryCount += 1;
                console.log(`Failed to get UK News... Retrying.`);
                if (nasaRetryCount < 5) {
                    return console.log(
                        `Failed to get NASA News... (Tried 5 times).`
                    );
                }
                return getNasaImage();
            });
    }
};
