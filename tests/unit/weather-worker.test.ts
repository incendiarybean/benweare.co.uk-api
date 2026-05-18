import {
    vi, describe, it, expect
} from 'vitest';
import * as commonUtils from '../../src/common/utils/common-utils.ts';

vi.spyOn(
    commonUtils, 'staticRefresher'
).mockImplementation(
    () => {
    }
);
vi.mock(
    '../../src/server', () => ({
        IO: {
            local: {
                emit: (): void => {
                }
            }
        }
    })
);
vi.mock(
    '../../src/common/utils/storage-utils', () => ({
        ObjectStorage: class TestObject {
            write(): void {
            }
        }
    })
);

describe(
    'Weather-Worker should collect weather as expected', () => {
        it(
            'should collect metoffice correctly', async () => {
                const { getMetOffice } = await import(
                    '../../src/workers/weather-worker.ts'
                );
                const { storage } = await import(
                    '../../src/index.ts'
                );
                const storageSpy = vi.spyOn(
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
                    '../../src/workers/weather-worker.ts'
                );
                const { storage } = await import(
                    '../../src/index.ts'
                );
                const storageSpy = vi.spyOn(
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
                const weatherWorker = await import(
                    '../../src/workers/weather-worker.ts'
                );

                const retryHandler = vi.spyOn(
                    commonUtils, 'retryHandler'
                );

                weatherWorker.getWeather();

                expect(
                    retryHandler
                ).toHaveBeenCalledTimes(
                    1
                );

                expect(
                    retryHandler
                ).toHaveBeenCalledWith(
                    weatherWorker.getMetOffice,
                    2
                );
            }
        );
    }
);
