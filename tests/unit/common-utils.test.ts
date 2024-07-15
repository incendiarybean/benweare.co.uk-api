import {
    dateGenerator,
    dateParses,
    fetchArticles,
    fetchWikiBody,
    getWikiContent,
    isBritishSummerTime,
    retryHandler,
    staticRefresher,
} from '../../src/common/utils/common-utils';

import { genericContent } from '../data/test-data';
import { readFileSync } from 'fs';

const mockAxios = globalThis.__mockAxios__;

// These mocks ensure that the real server will not be used
jest.mock('../../src/server', () => ({
    IO: {
        local: {
            emit: (...args) => {},
        },
    },
}));
jest.mock('../../src', () => ({}));

describe('Refresh & Retry utils should function as desired.', () => {
    it('should repeatedly call a function using the staticRefresher method', async () => {
        const loggerSpy = jest.spyOn(console, 'debug');
        jest.useFakeTimers();
        const testingStaticRefresher = () => {
            console.debug('Testing Refresh Handler');
        };
        staticRefresher(500, testingStaticRefresher);
        jest.advanceTimersToNextTimer();
        expect(loggerSpy.mock.calls.length).toBe(1);
        expect(loggerSpy).lastCalledWith('Testing Refresh Handler');

        jest.advanceTimersToNextTimer();
        expect(loggerSpy.mock.calls.length).toBe(2);
        expect(loggerSpy).lastCalledWith('Testing Refresh Handler');

        jest.clearAllTimers();
    });

    it('should repeatedly call a function when it fails a specific number of times', async () => {
        const loggerErrorSpy = jest.spyOn(console, 'error');

        const testFunction = async () => {
            throw new Error('Test Error');
        };
        retryHandler(testFunction, 2);

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 200));

        expect(loggerErrorSpy.mock.calls.length).toEqual(2);
        expect(loggerErrorSpy.mock.calls).toEqual([
            ['Function: testFunction failed... Retrying.'],
            ['Function: testFunction failed... (Tried 2 times).'],
        ]);
    });
});

describe('News articles should be fetched and formatted correctly', () => {
    it('should fetch a webpage and return an array of articles', async () => {
        const genericData = genericContent();
        mockAxios
            .onGet('http://getGenericArticles.com')
            .replyOnce(200, genericData);

        const result = await fetchArticles(
            'generic_article',
            'http://getGenericArticles.com',
            '.container',
            '.article'
        );

        expect(result).toBeDefined();
        expect(result.unformattedArticles.length).toEqual(1);
        expect(
            result.unformattedArticles[0]
                .querySelector('.title')
                ?.textContent?.trim()
        ).toEqual('Test Title');
    });
});

describe('Steam utils should fetch wiki data and format it correctly', () => {
    it('should return an array of achievements from the wiki page', async () => {
        const wikiData = await readFileSync('./tests/data/wiki.html');
        mockAxios.onGet('http://getWikiContent.com').replyOnce(200, wikiData);

        const result = await fetchWikiBody('http://getWikiContent.com');
        expect([result[0].trim()]).toEqual([
            '<td>Unlocked a new achievement!</td>',
        ]);
    });

    it('should only return a wiki if it is on record', async () => {
        const wikiData = await readFileSync('./tests/data/wiki.html');
        mockAxios
            .onGet('https://bindingofisaacrebirth.fandom.com/wiki/Achievements')
            .replyOnce(200, wikiData);

        let result = await getWikiContent('TestGameID');
        expect(result).toBeUndefined();

        result = (await getWikiContent('250900')) ?? [];
        result[0] = result[0].trim();
        expect(result).toEqual(['<td>Unlocked a new achievement!</td>']);
    });
});

describe('Date utils should return correct values', () => {
    it('should return whether a date parses correctly', () => {
        let result = dateParses('InvalidDate');
        expect(result).toEqual(false);

        result = dateParses(new Date().toString());
        expect(result).toEqual(true);
    });

    it('should create a valid UK date from existing/scratch', () => {
        const today = new Date();
        jest.useFakeTimers();
        jest.setSystemTime(today);

        let result = new Date(dateGenerator('InvalidDate')).toLocaleString(
            'en-GB'
        );

        expect(result).toEqual(today.toLocaleString('en-GB'));

        result = new Date(dateGenerator(new Date().toString())).toLocaleString(
            'en-GB'
        );
        expect(result).toEqual(today.toLocaleString('en-GB'));
    });

    it('should return whether it is currently British Summer Time', () => {
        const result = isBritishSummerTime();
        const currentDate = new Date();

        // Get the start-date of BST
        const startOfBST = new Date(currentDate.getFullYear(), 3, 1);
        startOfBST.setDate(
            startOfBST.getDate() -
                (startOfBST.getDay() === 0 ? 7 : startOfBST.getDay())
        );

        // Get the end-date of BST
        const endOfBST = new Date(currentDate.getFullYear(), 10, 1);
        endOfBST.setDate(
            endOfBST.getDate() -
                (endOfBST.getDay() === 0 ? 7 : endOfBST.getDay())
        );

        expect(result).toEqual(
            currentDate.getTime() >= startOfBST.getTime() &&
                currentDate.getTime() <= endOfBST.getTime()
        );
    });
});
