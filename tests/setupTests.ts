import {
    afterEach, beforeEach, vi
} from 'vitest';
import {
    arsTechnicaContent,
    bbcContent,
    metofficeContent,
    nasaContent,
    pcgContent,
    registerContent,
    rpsContent
} from './data/test-data.ts';

import axios from 'axios';

// Populate storage
beforeEach(
    async () => {
    // Stop Discord from running
        delete process.env['DISCORD_ENABLED'];

        // Configure mocked web requests
        console.info(
            `[${new Date}] Configuring Mock Axios requests...`
        );

        vi.spyOn(
            axios, 'get'
        ).mockImplementation(

            // @ts-expect-error this is fine
            (
                url
            ) => {

                console.log(
                    url
                );

                switch (url) {
                    case 'https://www.theregister.com/security': return Promise.resolve(
                        {
                            statusCode: 200,
                            data: registerContent()
                        }
                    );
                    case 'https://www.bbc.co.uk/news/england': return Promise.resolve(
                        {
                            statusCode: 200,
                            data: bbcContent()
                        }
                    );
                    case 'https://www.rockpapershotgun.com/latest': return Promise.resolve(
                        {
                            statusCode: 200,
                            data: rpsContent()
                        }
                    );
                    case 'https://www.pcgamer.com/uk/news/': return Promise.resolve(
                        {
                            statusCode: 200,
                            data: pcgContent()
                        }
                    );
                    case 'https://arstechnica.com/gadgets/': return Promise.resolve(
                        {
                            statusCode: 200,
                            data: arsTechnicaContent()
                        }
                    );
                    case `https://api.nasa.gov/planetary/apod?api_key=${process.env['NASA_API_KEY']}`: return Promise.resolve(
                        {
                            statusCode: 200,
                            data: nasaContent
                        }
                    );
                    case `https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/daily?${new URLSearchParams(
                        {
                            includeLocationName: 'true',
                            latitude: process.env['LATITUDE'] ?? '',
                            longitude: process.env['LONGITUDE'] ?? ''
                        }
                    ).toString()}`: return Promise.resolve(
                            {
                                statusCode: 200,
                                data: metofficeContent
                            }
                        );
                }
            }
        );
    }, 5000
);

afterEach(
    () => {
    // Reset Environment after each test
        // Reset Environment after each test
        process.env['NODE_ENV'] = 'test';

        vi.clearAllMocks();
        vi.resetAllMocks();
        vi.clearAllTimers();
    }
);
