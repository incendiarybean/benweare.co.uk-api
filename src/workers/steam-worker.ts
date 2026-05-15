import type { Request } from 'express';
import axios from 'axios';
import {
    getWikiContent, ServerError
} from '../common/utils/common-utils.ts';

/**
 * This function gets Steam Achievements for the user and a Wiki document where applicable
 * @param {Request} req Express request, to get query params
 * @returns Object containing achievements and Wiki Document as string
 */
async function getGameData(
    req: Request
): Promise<{
    achievements: unknown[],
    wiki: unknown,
}> {
    const {
        STEAM_API, STEAM_API_KEY
    } = process.env;
    const userId: string = req.query['userId'] as string;
    const gameId: string = req.query['gameId'] as string;

    if (!gameId) {
        const error = new Error(
            'No gameId provided!'
        ) as NodeJS.ErrnoException;

        error.code = '422';
        throw error;
    }

    /*
        Request from both achievement endpoints
        steamApiGameData -> Schema contains all available achievement data
        steamApiUserData -> Contains all user attained achievements
    */
    const steamApiGameData = `${STEAM_API}/ISteamUserStats/GetSchemaForGame/v0002?key=${STEAM_API_KEY}&appid=${gameId}`;
    const steamApiUserData = `${STEAM_API}/ISteamUserStats/GetPlayerAchievements/v0001?key=${STEAM_API_KEY}&appid=${gameId}&steamid=${userId}`;
    const fetchList = [
        steamApiGameData,
        ...userId ? [steamApiUserData] : []
    ];

    try {
        const wiki = await getWikiContent(
            gameId
        );
        const steam = await Promise.all(
            fetchList.map(
                (
                    url
                ) => axios.get(
                    url
                )
            )
        );

        const steamAchievements
            = steam[0]?.data.game.availableGameStats.achievements;

        if (userId) {
            const playerAchievements = steam[1]?.data.playerstats.achievements;

            // Steam's API is inconsistent -> steamAchievements.name = playerAchievements.apiname
            const achievementList = playerAchievements.map(
                (
                    achieve: { apiname: string, }
                ) => ({
                    ...steamAchievements.filter(
                        (
                            item: { name: string, }
                        ) => item.name === achieve.apiname
                    )[0],
                    ...achieve
                })
            );

            return {
                achievements: achievementList,
                wiki
            };
        }

        return {
            achievements: steamAchievements,
            wiki
        };
    }
    catch (error) {
        throw new ServerError(
            (error as Error).message, 502
        );
    }
}

export { getGameData };
