import {
    steamContent, steamUserContent
} from '../data/test-data.ts';

import { getGameData } from '../../src/workers/steam-worker.ts';
import {
    describe, expect, it, vi
} from 'vitest';
import axios from 'axios';
import type { Request } from 'express';
import { ServerError } from '../../src/common/utils/common-utils.ts';


// These mocks ensure that the real server will not be used
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
    '../../src', () => ({})
);

describe(
    'The Steam-Worker should correctly validate data and return it', () => {
        it(
            'should return a valid object containing achievements without a steam userId', async () => {
                vi.spyOn(
                    axios, 'get'
                ).mockResolvedValueOnce(
                    {
                        statusCode: 200,
                        data: steamContent
                    }
                );


                const req = {
                    query: {
                        userId: undefined,
                        gameId: 'TestGameID'
                    }
                };

                const result = await getGameData(
                    req as unknown as Request
                );

                expect(
                    result
                ).toEqual(
                    {
                        achievements: [
                            {
                                name: '1',
                                defaultvalue: 0,
                                displayName: 'Test Achievement',
                                hidden: 0,
                                description: 'New Achievement!',
                                icon: 'steamIcon',
                                icongray: 'steamIconGray'
                            }
                        ],
                        wiki: undefined
                    }
                );
            }
        );

        it(
            'should return a valid object containing achievements with a steam userId', async () => {
                vi.spyOn(
                    axios, 'get'
                ).mockResolvedValueOnce(
                    {
                        statusCode: 200,
                        data: steamContent
                    }
                );

                vi.spyOn(
                    axios, 'get'
                ).mockResolvedValueOnce(
                    {
                        statusCode: 200,
                        data: steamUserContent
                    }
                );

                const req = {
                    query: {
                        userId: 'SteamUserID',
                        gameId: 'TestGameID'
                    }
                };

                const result = await getGameData(
                    req as unknown as Request
                );

                expect(
                    result
                ).toEqual(
                    {
                        achievements: [
                            {
                                achieved: 1,
                                apiname: '1',
                                name: '1',
                                defaultvalue: 0,
                                displayName: 'Test Achievement',
                                hidden: 0,
                                description: 'New Achievement!',
                                icon: 'steamIcon',
                                icongray: 'steamIconGray',
                                unlocktime: 1657572168
                            }
                        ],
                        wiki: undefined
                    }
                );
            }
        );

        it(
            'should throw if no gameId is given', async () => {
                const req = {
                    query: {
                        userId: undefined,
                        gameId: undefined
                    }
                };

                expect(
                    async () => await getGameData(
                        req as unknown as Request
                    )
                ).rejects.toEqual(
                    new ServerError(
                        'No gameId provided!', 422
                    )
                );
            }
        );

        it(
            'should throw if axios call to steam fails', async () => {
                vi.spyOn(
                    axios, 'get'
                ).mockRejectedValue(
                    {
                        statusCode: 502,
                        data: { message: 'Bad Gateway' }
                    }
                );

                const req = {
                    query: {
                        userId: 'SteamUserID',
                        gameId: 'TestGameID'
                    }
                };

                expect(
                    async () => await getGameData(
                        req as unknown as Request
                    )
                ).rejects.toEqual(
                    new ServerError(
                        '', 502
                    )
                );
            }
        );
    }
);
