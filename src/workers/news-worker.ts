import axios from "axios";
import type { NasaArticle, NewsArticle, UndefinedNews } from "@common/types";
import {
    dateGenerator,
    fetchArticles,
    retryHandler,
    staticRefresher,
} from "@common/utils/common-utils";
import { IO } from "@server";
import { storage } from "..";

/**
 * This function gets news for the given outlet
 * @returns void -> Writes data to storage object
 */
export const getRPSNews = (): Promise<void> =>
    fetchArticles(
        "https://www.rockpapershotgun.com/latest",
        ".articles",
        "li"
    ).then((HTMLArticles: Element[]) => {
        const site: string = "RockPaperShotgun";
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews =
                HTMLDivElement.querySelector(
                    ".title"
                )?.children[0].textContent?.trim();
            if (title) {
                const url: string =
                    HTMLDivElement.querySelector("a")?.href ?? "Not Found";

                const img: string =
                    HTMLDivElement.querySelector(
                        ".thumbnail_image"
                    )?.getAttribute("src") ?? "Not Found";

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector("time")?.getAttribute(
                        "datetime"
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
        storage.write("NEWS", site, `${site}'s Latest News.`, articles);
        IO.local.emit("RELOAD_NEWS");
    });

/**
 * This function gets news for the given outlet
 * @returns void -> Writes data to storage object
 */
export const getPCGamerNews = (): Promise<void> =>
    fetchArticles(
        "https://www.pcgamer.com/uk/news/",
        "[data-list='news/news/latest']",
        ".listingResult"
    ).then((HTMLArticles: Element[]) => {
        const site: string = "PCGamer";
        const articles: NewsArticle[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews =
                HTMLDivElement.querySelector(
                    ".article-name"
                )?.textContent?.trim();
            if (title) {
                const url: string =
                    HTMLDivElement.querySelector("a")?.href ?? "Not Found";

                const img: string =
                    HTMLDivElement.querySelector(
                        ".article-lead-image-wrap"
                    )?.getAttribute("data-original") ?? "Not Found";

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
            }
        });
        storage.write("NEWS", site, `${site}'s Latest News.`, articles);
        IO.local.emit("RELOAD_NEWS");
    });

/**
 * This function gets news for the given outlet
 * @returns void -> Writes data to storage object
 */
export const getUKNews = (): Promise<void> =>
    fetchArticles(
        "https://www.bbc.co.uk/news/england",
        "#topos-component",
        ".gs-t-News"
    ).then((HTMLArticles: Element[]) => {
        const site: string = "BBC";
        const articles: NewsArticle[] = [];
        const articleTitles: string[] = [];

        HTMLArticles.forEach((HTMLDivElement) => {
            const title: UndefinedNews = HTMLDivElement.querySelector(
                ".gs-c-promo-heading__title"
            )?.textContent?.trim();
            if (title) {
                let imgUrl: UndefinedNews =
                    HTMLDivElement.querySelector("img")?.getAttribute(
                        "data-src"
                    );

                if (imgUrl) {
                    imgUrl = imgUrl.replace(/\{width}/g, "720");
                } else {
                    imgUrl =
                        HTMLDivElement.querySelector("img")?.src ?? "Not Found";
                }

                const img = imgUrl;

                const url: string = HTMLDivElement.querySelector("a")?.href
                    ? `https://bbc.co.uk${
                          HTMLDivElement.querySelector("a")?.href
                      }`
                    : "Not Found";

                const date: string = dateGenerator(
                    HTMLDivElement.querySelector("time")?.getAttribute(
                        "datetime"
                    )
                );

                const live =
                    HTMLDivElement.querySelector("a")?.href.split("/")[2] ??
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
            }
        });
        storage.write("NEWS", site, `${site}'s Latest News.`, articles);
        IO.local.emit("RELOAD_NEWS");
    });

/**
 * This function gets news for the given outlet
 * @returns void -> Writes data to storage object
 */
export const getNasaImage = (): Promise<void> =>
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
            storage.write("NEWS", site, "NASA Daily Image.", articles);
        });

export const getNews = (): void => {
    retryHandler(getPCGamerNews, 5);
    retryHandler(getRPSNews, 5);
    retryHandler(getUKNews, 5);
    retryHandler(getNasaImage, 5);
};

staticRefresher(480000, getNews, "News");
