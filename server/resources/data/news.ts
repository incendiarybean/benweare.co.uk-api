import { NewsResponse } from "@lib/types";

export const MOCK_BBC_NEWS_RESPONSE = [
    {
        title: "Archie's family seek permission for hospice move",
        link: "/",
        img: "https://ichef.bbci.co.uk/news/490/cpsprodpb/11809/production/_126098617_hi075971431.jpg",
        date: "04/08/2022",
        site: "No Origin",
    },
    {
        title: "UK interest rates see biggest rise in 27 years",
        link: "/",
        img: "https://ichef.bbci.co.uk/news/720/cpsprodpb/4767/production/_126197281_gettyimages-152838792.jpg",
        date: "04/08/2022",
        site: "No Origin",
    },
];

export const MOCK_PC_NEWS_RESPONSE = [
    {
        title: "Fromsoft CEO Hidetaka Miyazaki to receive the top gong from Japan's industry body",
        link: "/",
        img: "https://cdn.mos.cms.futurecdn.net/xNdteGXNmaomL78qRJoe5Y.jpg",
        date: "04/08/2022",
        site: "No Origin",
    },
    {
        title: "Steam Deck preorders are finally available in parts of Asia",
        link: "/",
        img: "https://cdn.mos.cms.futurecdn.net/pasVmcfXubSkdDq2QD89cX.jpg",
        date: "04/08/2022",
        site: "No Origin",
    },
];

export const MOCK_NASA_NEWS_RESPONSE = {
    copyright: "Joan Josep Isach Cogollos",
    date: "2022-08-04",
    explanation:
        'In 1716, English astronomer Edmond Halley noted, "This is but a little Patch, but it shows itself to the naked Eye, when the Sky is serene and the Moon absent." Of course, M13 is now less modestly recognized as the Great Globular Cluster in Hercules, one of the brightest globular star clusters in the northern sky. Sharp telescopic views like this one reveal the spectacular cluster\'s hundreds of thousands of stars. At a distance of 25,000 light-years, the cluster stars crowd into a region 150 light-years in diameter. Approaching the cluster core upwards of 100 stars could be contained in a cube just 3 light-years on a side. For comparison, the closest star to the Sun is over 4 light-years away. The remarkable range of brightness recorded in this image follows stars into the dense cluster core. Distant background galaxies in the medium-wide field of view include NGC 6207 at the upper left.',
    hdurl: "https://apod.nasa.gov/apod/image/2208/M13_final2_sinfirma.jpg",
    media_type: "image",
    service_version: "v1",
    title: "M13: The Great Globular Cluster in Hercules",
    url: "https://apod.nasa.gov/apod/image/2208/M13_final2_sinfirma1024.jpg",
    site: "NASA",
};

export const MOCK_NEWS_RESPONSE: NewsResponse = {
    pc: MOCK_PC_NEWS_RESPONSE,
    bbc: MOCK_BBC_NEWS_RESPONSE,
    nasa: MOCK_NASA_NEWS_RESPONSE,
};
