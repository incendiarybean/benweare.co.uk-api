import {
    arsTechnicaContent,
    bbcContent,
    metofficeContent,
    nasaContent,
    pcgContent,
    registerContent,
    rpsContent,
} from './data/test-data';

import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mockAxios = new MockAdapter(axios);
globalThis.__mockAxios__ = mockAxios;

// Populate storage
beforeAll(async () => {
    // Stop Discord from running
    delete process.env.DISCORD_ENABLED;

    // Configure mocked web requests
    console.info(`[${new Date()}] Configuring Mock Axios requests...`);
    mockAxios
        .onGet('https://www.theregister.com/security')
        .reply(200, registerContent());

    mockAxios
        .onGet('https://www.bbc.co.uk/news/england')
        .reply(200, bbcContent());

    mockAxios
        .onGet('https://www.rockpapershotgun.com/latest')
        .reply(200, rpsContent());

    mockAxios
        .onGet('https://www.pcgamer.com/uk/news/')
        .reply(200, pcgContent());

    mockAxios
        .onGet('https://arstechnica.com/gadgets/')
        .reply(200, arsTechnicaContent());

    mockAxios
        .onGet(
            `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
        )
        .reply(200, nasaContent);

    mockAxios
        .onGet(
            `https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/daily?${new URLSearchParams(
                {
                    includeLocationName: 'true',
                    latitude: process.env.LATITUDE ?? '',
                    longitude: process.env.LONGITUDE ?? '',
                }
            ).toString()}`
        )
        .reply(200, metofficeContent);
}, 5000);

afterEach(() => {
    // Reset Environment after each test
    process.env.NODE_ENV = 'test';

    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.clearAllTimers();
});
