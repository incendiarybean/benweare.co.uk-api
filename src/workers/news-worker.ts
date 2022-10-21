import axios from "axios";
import { mockNewsArticles } from "@common/resources/news-resources";
import type { NasaArticle, NewsArticle } from "@common/types";
import {
    dateGenerator,
    fetchArticles,
    staticRefresher,
} from "@common/utils/common-utils";
import { ObjectStorage } from "@common/utils/storage-utils";
import { IO } from "@server";

/*--------------*/
/*    CONFIG    */
/*--------------*/

let pcRetryCount = 0;
let ukRetryCount = 0;
let nasaRetryCount = 0;

export const storage = new ObjectStorage();

/*--------------*/
/* INTERACTIONS */
/*--------------*/

export const getNews = (): void => {
    getPCNews();
    getUKNews();
    getNasaImage();
};

const getPCNews = (): Promise<void> =>
    fetchArticles(
        "https://www.pcgamer.com/uk/",
        ".list-text-links-trending-panel",
        ".listingResult"
    )
        .then((HTMLArticles: Element[]) => {
            const site: string = "PCGamer";
            const articles: NewsArticle[] = [];

            HTMLArticles.forEach((HTMLDivElement) => {
                const title: string =
                    HTMLDivElement.querySelector(".article-name")
                        ?.textContent || "Not Found";

                const url: string =
                    HTMLDivElement.querySelector("a")?.href || "Not Found";

                const img: string =
                    HTMLDivElement.querySelector(
                        ".article-lead-image-wrap"
                    )?.getAttribute("data-original") || "Not Found";

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector(
                        ".relative-date"
                    )?.getAttribute("datetime")
                );

                articles.push({
                    title,
                    url,
                    img,
                    date,
                });
            });
            pcRetryCount = 0;

            storage.write(site, articles, `${site}'s Latest News.`);

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

const getUKNews = (): Promise<void> =>
    fetchArticles(
        "https://www.bbc.co.uk/news/england",
        "#topos-component",
        ".gs-t-News"
    )
        .then((HTMLArticles: Element[]) => {
            const site: string = "BBC";
            const articles: NewsArticle[] = [];
            const articleTitles: string[] = [];

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

                const url: string =
                    `https://bbc.co.uk${
                        HTMLDivElement.querySelector("a")?.href
                    }` || "Not Found";

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector("time")?.getAttribute(
                        "datetime"
                    )
                );

                const live =
                    HTMLDivElement.querySelector("a")?.href.split("/")[2] ||
                    "Not Found";

                if (!articleTitles.includes(title) && live !== "live") {
                    articleTitles.push(title);
                    articles.push({
                        title,
                        url,
                        img,
                        date,
                    });
                }
            });
            ukRetryCount = 0;
            storage.write(site, articles, `${site}'s Latest News.`);
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

const getNasaImage = (): void => {
    if (process.env.NASA_API_KEY) {
        axios
            .get(
                `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
            )
            .then(({ data }: { data: NasaArticle }) => {
                const site: string = "NASA";
                const articles = [
                    {
                        title: data.title,
                        url: data.url,
                        description: data.explanation,
                        img: data.url,
                        date: dateGenerator(data.date),
                    },
                ];

                storage.write(site, articles, "NASA Daily Image.");
            })
            .catch(() => {
                nasaRetryCount += 1;
                console.log(`Failed to get NASA News... Retrying.`);
                if (nasaRetryCount < 5) {
                    return console.log(
                        `Failed to get NASA News... (Tried 5 times).`
                    );
                }
                return getNasaImage();
            });
    }
};

/*--------------*/
/*    EVENTS    */
/*--------------*/

const { NODE_ENV } = process.env;
const service = "News";

setImmediate(() => {
    if (NODE_ENV === "test") {
        console.log(`[${new Date()}] Initialising Offline ${service}...`);
        storage.write(
            "OUTLET NAME",
            mockNewsArticles,
            "NEWS OUTLET DESCRIPTION"
        );
    } else {
        staticRefresher(480000, getNews, service);
    }
});
