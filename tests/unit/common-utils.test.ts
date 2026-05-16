import {
    describe, it, expect, vi
} from 'vitest';
import {
    dateGenerator,
    dateParses,
    fetchArticles,
    fetchWikiBody,
    getWikiContent,
    isBritishSummerTime,
    retryHandler,
    staticRefresher
} from '../../src/common/utils/common-utils.ts';

import { genericContent } from '../data/test-data.ts';
import { readFileSync } from 'fs';
import axios from 'axios';


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
    'Refresh & Retry utils should function as desired.', () => {
        it(
            'should repeatedly call a function using the staticRefresher method', async () => {
                const loggerSpy = vi.spyOn(
                    console, 'debug'
                );

                vi.useFakeTimers();
                const testingStaticRefresher = (): void => {
                    console.debug(
                        'Testing Refresh Handler'
                    );
                };

                staticRefresher(
                    500, testingStaticRefresher
                );
                vi.advanceTimersToNextTimer();
                expect(
                    loggerSpy.mock.calls.length
                ).toBe(
                    1
                );
                expect(
                    loggerSpy
                ).toHaveBeenLastCalledWith(
                    'Testing Refresh Handler'
                );

                vi.advanceTimersToNextTimer();
                expect(
                    loggerSpy.mock.calls.length
                ).toBe(
                    2
                );
                expect(
                    loggerSpy
                ).toHaveBeenLastCalledWith(
                    'Testing Refresh Handler'
                );

                vi.clearAllTimers();
            }
        );

        it(
            'should repeatedly call a function when it fails a specific number of times', async () => {
                const loggerErrorSpy = vi.spyOn(
                    console, 'error'
                );

                const testFunction = async (): Promise<void> => {
                    throw new Error(
                        'Test Error'
                    );
                };

                retryHandler(
                    testFunction, 2
                );

                vi.useRealTimers();
                await new Promise(
                    (
                        resolve
                    ) => setTimeout(
                        resolve, 200
                    )
                );

                expect(
                    loggerErrorSpy.mock.calls.length
                ).toEqual(
                    2
                );
                expect(
                    loggerErrorSpy.mock.calls
                ).toEqual(
                    [
                        ['Function: testFunction failed... Retrying.'],
                        ['Function: testFunction failed... (Tried 2 times).']
                    ]
                );
            }
        );
    }
);

describe(
    'News articles should be fetched and formatted correctly', () => {
        it(
            'should fetch a webpage and return an array of articles', async () => {
                const genericData = genericContent();

                vi.spyOn(
                    axios, 'get'
                ).mockResolvedValueOnce(
                    {
                        statusCode: 200,
                        data: genericData
                    }
                );

                const result = await fetchArticles(
                    'generic_article',
                    'http://getGenericArticles.com',
                    '.container',
                    '.article'
                );

                expect(
                    result
                ).toBeDefined();
                expect(
                    result.unformattedArticles.length
                ).toEqual(
                    1
                );
                expect(
                    result.unformattedArticles[0]?.
                        querySelector(
                            '.title'
                        )?.
                        textContent?.trim()
                ).toEqual(
                    'Test Title'
                );
            }
        );
    }
);

describe(
    'Steam utils should fetch wiki data and format it correctly', () => {
        it(
            'should return an array of achievements from the wiki page', async () => {
                const wikiData = await readFileSync(
                    './tests/data/wiki.html'
                );

                vi.spyOn(
                    axios, 'get'
                ).mockResolvedValueOnce(
                    {
                        statusCode: 200,
                        data: wikiData
                    }
                );

                const result = await fetchWikiBody(
                    'http://getWikiContent.com'
                );

                expect(
                    [result[0]?.trim()]
                ).toEqual(
                    ['<td>Unlocked a new achievement!</td>']
                );
            }
        );

        it(
            'should only return a wiki if it is on record', async () => {
                const wikiData = await readFileSync(
                    './tests/data/wiki.html'
                );

                vi.spyOn(
                    axios, 'get'
                ).mockResolvedValueOnce(
                    {
                        statusCode: 200,
                        data: wikiData
                    }
                );

                let result = await getWikiContent(
                    'TestGameID'
                );

                expect(
                    result
                ).toBeUndefined();

                result = await getWikiContent(
                    '250900'
                ) ?? [];
                result[0] = result[0]?.trim() as string;
                expect(
                    result
                ).toEqual(
                    ['<td>Unlocked a new achievement!</td>']
                );
            }
        );
    }
);

describe(
    'Date utils should return correct values', () => {
        it(
            'should return whether a date parses correctly', () => {
                let result = dateParses(
                    'InvalidDate'
                );

                expect(
                    result
                ).toEqual(
                    false
                );

                result = dateParses(
                    (new Date).toString()
                );
                expect(
                    result
                ).toEqual(
                    true
                );
            }
        );

        it(
            'should create a valid UK date from existing/scratch', () => {
                const today = new Date;

                vi.useFakeTimers();
                vi.setSystemTime(
                    today
                );

                let result = new Date(
                    dateGenerator(
                        'InvalidDate'
                    )
                ).toLocaleString(
                    'en-GB'
                );

                expect(
                    result
                ).toEqual(
                    today.toLocaleString(
                        'en-GB'
                    )
                );

                result = new Date(
                    dateGenerator(
                        (new Date).toString()
                    )
                ).toLocaleString(
                    'en-GB'
                );
                expect(
                    result
                ).toEqual(
                    today.toLocaleString(
                        'en-GB'
                    )
                );
            }
        );

        it(
            'should return whether it is currently British Summer Time', () => {
                const result = isBritishSummerTime();
                const currentDate = new Date;

                // Get the start-date of BST
                const startOfBST = new Date(
                    currentDate.getFullYear(), 3, 1
                );

                startOfBST.setDate(
                    startOfBST.getDate()
                    - (startOfBST.getDay() === 0
                        ? 7
                        : startOfBST.getDay())
                );

                // Get the end-date of BST
                const endOfBST = new Date(
                    currentDate.getFullYear(), 10, 1
                );

                endOfBST.setDate(
                    endOfBST.getDate()
                    - (endOfBST.getDay() === 0
                        ? 7
                        : endOfBST.getDay())
                );

                expect(
                    result
                ).toEqual(
                    currentDate.getTime() >= startOfBST.getTime()
                    && currentDate.getTime() <= endOfBST.getTime()
                );
            }
        );
    }
);
