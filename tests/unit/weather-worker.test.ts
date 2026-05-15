import {
    jest, describe, it, expect
} from '@jest/globals';

// These mocks ensure that the real server, storage and refresher will not be used
jest.mock(
    '../../src/server', () => ({
        IO: {
            local: {
                emit: () => {
                }
            }
        }
    })
);
jest.mock(
    '../../src/common/utils/common-utils', () => ({
        ...jest.requireActual(
            '../../src/common/utils/common-utils'
        ) as object,
        staticRefresher: () => {
        }
    })
);

jest.mock(
    '../../src/common/utils/storage-utils', () => ({
        ObjectStorage: class TestObject {
            write() {
            }
        }
    })
);

describe(
    'Weather-Worker should collect weather as expected', () => {
        it(
            'should collect metoffice correctly', async () => {
                const { getMetOffice } = await import(
                    '../../src/workers/weather-worker'
                );
                const { storage } = await import(
                    '../../src'
                );
                const storageSpy = jest.spyOn(
                    storage, 'write'
                );

                await getMetOffice();

                expect(
                    storageSpy.mock.calls.length
                ).toEqual(
                    1
                );
                expect(
                    storageSpy.mock.calls
                ).toEqual(
                    [
                        [
                            'WEATHER',
                            'MetOffice',
                            'Weather in testing',
                            [
                                {
                                    maxFeels: '18º',
                                    lowTemp: '14º',
                                    maxTemp: '20º',
                                    maxWindSpeed: 3,
                                    date: '2023-02-01T00:00:00.000Z',
                                    weather: 'cloud',
                                    weatherDescription: 'Cloudy'
                                },
                                {
                                    lowTemp: '13º',
                                    maxFeels: '16º',
                                    maxTemp: '18º',
                                    maxWindSpeed: 3,
                                    date: '2023-02-02T00:00:00.000Z',
                                    weather: 'rain',
                                    weatherDescription: 'Light rain'
                                }
                            ]
                        ]
                    ]
                );
            }
        );

        it(
            'should use fake MetOffice data in development', async () => {
                process.env['NODE_ENV'] = 'development';

                const { getWeather } = await import(
                    '../../src/workers/weather-worker'
                );
                const { storage } = await import(
                    '../../src'
                );
                const storageSpy = jest.spyOn(
                    storage, 'write'
                );

                getWeather();

                expect(
                    storageSpy.mock.calls.length
                ).toEqual(
                    1
                );
                expect(
                    storageSpy.mock.calls
                ).toEqual(
                    [
                        [
                            'WEATHER',
                            'MetOffice',
                            'Weather in development',
                            [
                                {
                                    maxFeels: '18º',
                                    lowTemp: '14º',
                                    maxTemp: '20º',
                                    maxWindSpeed: 3,
                                    date: '2023-02-01T00:00:00.000Z',
                                    weather: 'cloud',
                                    weatherDescription: 'Cloudy'
                                },
                                {
                                    lowTemp: '13º',
                                    maxFeels: '16º',
                                    maxTemp: '18º',
                                    maxWindSpeed: 3,
                                    date: '2023-02-02T00:00:00.000Z',
                                    weather: 'rain',
                                    weatherDescription: 'Light rain'
                                }
                            ]
                        ]
                    ]
                );
            }
        );

        it(
            'should collect all weather when requested', async () => {
                const { getWeather } = await import(
                    '../../src/workers/weather-worker'
                );
                const weatherWorker = await import(
                    '../../src/workers/weather-worker'
                );

                const getMetOffice = jest.spyOn(
                    weatherWorker, 'getMetOffice'
                );

                getWeather();

                expect(
                    getMetOffice
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );
    }
);
