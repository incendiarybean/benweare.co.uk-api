const rpsOutput = [
    [
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
    ],
];
const pcgOutput = [
    [
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
    ],
];
const bbcOutput = [
    [
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
    ],
];
const nasaOutput = [
    [
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
    ],
];
describe("news-worker should collect news as expected", () => {
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should collect rockpapershotgun news correctly", async () => {
        const { getRPSNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getRPSNews();
        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual(rpsOutput);
    });

    it("should collect pcgamer news correctly", async () => {
        const { getPCGamerNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getPCGamerNews();
        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual(pcgOutput);
    });

    it("should collect bbc news correctly", async () => {
        const { getUKNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getUKNews();
        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual(bbcOutput);
    });

    it("should collect the nasa daily image correctly", async () => {
        const { getNasaImage } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        await getNasaImage();
        expect(storageSpy.mock.calls.length).toEqual(1);
        expect(storageSpy.mock.calls).toEqual(nasaOutput);
    });

    it("should collect all news when requested", async () => {
        const { getNews } = require("../../src/workers/news-worker");
        const { storage } = require("../../src");
        const storageSpy = jest.spyOn(storage, "write");

        getNews();

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 3000));

        expect(storageSpy.mock.calls.length).toEqual(4);
        expect(storageSpy.mock.calls.sort()).toEqual(
            [...rpsOutput, ...pcgOutput, ...bbcOutput, ...nasaOutput].sort()
        );
    });
});
