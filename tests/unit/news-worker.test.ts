import { JSDOM } from "jsdom";

// These mocks ensure that the real server, storage and refresher will not be used
jest.mock("../../src/server", () => ({
    IO: {
        local: {
            emit: (...args) => {},
        },
    },
}));
jest.mock("../../src/common/utils/common-utils", () => ({
    ...jest.requireActual("../../src/common/utils/common-utils"),
    staticRefresher: (...args) => {},
}));
jest.mock("../../src/common/utils/storage-utils", () => ({
    ObjectStorage: class TestObject {
        constructor() {}
        write(...args) {}
    },
}));

describe("News-Worker should collect news as expected", () => {
    it("should collect RPS news correctly", async () => {
        const { getRPSNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getRPSNews();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0]).toEqual([
            "NEWS",
            "RockPaperShotgun",
            "RockPaperShotgun's Latest News.",
            [
                {
                    date: "01/02/2023",
                    img: "test-img.png",
                    title: "Test Title",
                    url: "/test",
                },
            ],
        ]);
    });

    it("should use default values for RPS content if missing", async () => {
        const { getRPSNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        const commonUtils = require("../../src/common/utils/common-utils");
        const document = new JSDOM(`
            <li>
                <div class="li">
                    <div class="title">
                        <div>Test Title</div>
                    </div>
                </div>
            </li>
        `).window.document;

        jest.spyOn(commonUtils, "fetchArticles").mockResolvedValueOnce([
            document,
        ]);

        await getRPSNews();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0][3]).toEqual([
            {
                title: "Test Title",
                date: new Date().toLocaleDateString("en-UK"),
                img: "Not Found",
                url: "Not Found",
            },
        ]);
    });

    it("should collect PCGamer news correctly", async () => {
        const { getPCGamerNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getPCGamerNews();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0]).toEqual([
            "NEWS",
            "PCGamer",
            "PCGamer's Latest News.",
            [
                {
                    date: "01/02/2023",
                    img: "test-img.png",
                    title: "Test Title",
                    url: "/test",
                },
            ],
        ]);
    });

    it("should use default values for PCGamer content if missing", async () => {
        const { getPCGamerNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        const commonUtils = require("../../src/common/utils/common-utils");
        const document = new JSDOM(`
            <li>
                <div class="li">
                    <div class="article-name">
                        Test Title
                    </div>
                </div>
            </li>
        `).window.document;

        jest.spyOn(commonUtils, "fetchArticles").mockResolvedValueOnce([
            document,
        ]);

        await getPCGamerNews();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0][3]).toEqual([
            {
                title: "Test Title",
                date: new Date().toLocaleDateString("en-UK"),
                img: "Not Found",
                url: "Not Found",
            },
        ]);
    });

    it("should collect bbc news correctly", async () => {
        const { getUKNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getUKNews();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0]).toEqual([
            "NEWS",
            "BBC",
            "BBC's Latest News.",
            [
                {
                    date: "01/02/2023",
                    img: "test-img.png",
                    title: "Test Title",
                    url: "https://bbc.co.uk/test",
                },
            ],
        ]);
    });

    it("should use default values for BBC content if missing", async () => {
        const { getUKNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        const commonUtils = require("../../src/common/utils/common-utils");
        const document = new JSDOM(`
            <li>
                <div class="li">
                    <div class="gs-c-promo-heading__title">
                        Test Title
                    </div>
                </div>
            </li>
        `).window.document;

        jest.spyOn(commonUtils, "fetchArticles").mockResolvedValueOnce([
            document,
        ]);

        await getUKNews();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0][3]).toEqual([
            {
                title: "Test Title",
                date: new Date().toLocaleDateString("en-UK"),
                img: "Not Found",
                url: "Not Found",
            },
        ]);
    });

    it("should collect the nasa daily image correctly", async () => {
        const { getNasaImage } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getNasaImage();

        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls[0]).toEqual([
            "NEWS",
            "NASA",
            "NASA Daily Image.",
            [
                {
                    date: "01/02/2023",
                    description: "Test Explanation",
                    img: "test-image.png",
                    title: "Test Title",
                    url: "test-image.png",
                },
            ],
        ]);
    });

    it("should call all collectors when requested", () => {
        const { getNews } = require("../../src/workers/news-worker");
        const newsWorker = require("../../src/workers/news-worker");

        const getRPSNews = jest.spyOn(newsWorker, "getRPSNews");
        const getPCGamerNews = jest.spyOn(newsWorker, "getPCGamerNews");
        const getUKNews = jest.spyOn(newsWorker, "getUKNews");
        const getNasaImage = jest.spyOn(newsWorker, "getNasaImage");

        getNews();

        expect(getRPSNews).toBeCalledTimes(1);
        expect(getPCGamerNews).toBeCalledTimes(1);
        expect(getUKNews).toBeCalledTimes(1);
        expect(getNasaImage).toBeCalledTimes(1);
    });
});
