import { readFileSync } from "fs";
import {
    dateGenerator,
    dateParses,
    fetchArticles,
    fetchWikiBody,
    getWikiContent,
    retryHandler,
    staticRefresher,
} from "../../src/common/utils/common-utils";
import { genericContent } from "../data/test-data";

const mockAxios = globalThis.__mockAxios__;

describe("Refresh & Retry utils should function as desired.", () => {
    it("should repeatedly call a function using the staticRefresher method", async () => {
        const loggerSpy = jest.spyOn(console, "debug");

        staticRefresher(
            500,
            () => {
                console.debug("Testing Refresh Handler");
            },
            "Testing staticRefresher"
        );
        jest.advanceTimersToNextTimer();
        expect(loggerSpy.mock.calls.length).toBe(1);
        expect(loggerSpy).lastCalledWith("Testing Refresh Handler");

        jest.advanceTimersToNextTimer();
        expect(loggerSpy.mock.calls.length).toBe(2);
        expect(loggerSpy).lastCalledWith("Testing Refresh Handler");

        jest.clearAllTimers();
    });

    it("should repeatedly call a function when it fails a specific number of times", async () => {
        const loggerErrorSpy = jest.spyOn(console, "error");

        const testFunction = async () => {
            throw new Error("Test Error");
        };
        retryHandler(testFunction, 2);

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(loggerErrorSpy.mock.calls.length).toEqual(2);
        expect(loggerErrorSpy.mock.calls).toEqual([
            ["Function: testFunction failed... Retrying."],
            ["Function: testFunction failed... (Tried 2 times)."],
        ]);
    });
});

describe("News articles should be fetched and formatted correctly", () => {
    it("should fetch a webpage and return an array of articles", async () => {
        const genericData = genericContent();
        mockAxios
            .onGet("http://getGenericArticles.com")
            .replyOnce(200, genericData);

        const result = await fetchArticles(
            "http://getGenericArticles.com",
            ".container",
            ".article"
        );

        expect(result).toBeDefined();
        expect(result.length).toEqual(1);
        expect(result[0].querySelector(".title")?.textContent?.trim()).toEqual(
            "Test Title"
        );
    });
});

describe("Steam utils should fetch wiki data and format it correctly", () => {
    it("should return an array of achievements from the wiki page", async () => {
        const wikiData = await readFileSync("./tests/data/wiki.html");
        mockAxios.onGet("http://getWikiContent.com").replyOnce(200, wikiData);

        const result = await fetchWikiBody("http://getWikiContent.com");
        expect(result).toEqual(["<td>Unlocked a new achievement!</td>"]);
    });

    it("should only return a wiki if it is on record", async () => {
        const wikiData = await readFileSync("./tests/data/wiki.html");
        mockAxios
            .onGet("https://bindingofisaacrebirth.fandom.com/wiki/Achievements")
            .replyOnce(200, wikiData);

        let result = await getWikiContent("TestGameID");
        expect(result).toBeUndefined();

        result = await getWikiContent("250900");
        expect(result).toEqual(["<td>Unlocked a new achievement!</td>"]);
    });
});

describe("Date utils should return correct values", () => {
    it("should return whether a date parses correctly", () => {
        let result = dateParses("InvalidDate");
        expect(result).toEqual(false);

        result = dateParses(new Date().toString());
        expect(result).toEqual(true);
    });

    it("should create a valid UK date from existing/scratch", () => {
        let result = dateGenerator("InvalidDate");
        const today = new Date().toLocaleDateString("en-UK");

        expect(result).toEqual(today);

        result = dateGenerator(new Date().toString());
        expect(result).toEqual(today);
    });
});
