import { ActivityType } from 'discord.js';
import { assist, client, cry, roll, rpg } from '@workers/discord-worker';

const { DISCORD_TOKEN, DISCORD_ENABLED } = process.env;

client.on('ready', () => {
    console.info(
        `[${new Date()}] Discord Bot ${client.user?.tag} has logged in!`
    );

    if (client.user) {
        client.user.setActivity('sitting here and taking it...', {
            type: ActivityType.Competing,
        });
    }
});

/**
 * This block handles direct messages to the bot
 */
client.on('messageCreate', async (interaction) => {
    if (!interaction.content) return;

    // TODO: Do something cool here!
});

/**
 * This block handles button commands to the bot
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'ClearDiceRoll') {
        try {
            await interaction.message.delete();
        } catch (e) {
            interaction.reply({
                content: 'Dismiss button has already been clicked, dismiss me!',
                ephemeral: true,
            });
        }
    }
});

/**
 * This block handles slash commands to the bot
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.commandName) {
        case 'assist':
            assist(interaction);
            break;
        case 'cry':
            cry(interaction);
            break;
        case 'roll':
            roll(interaction);
            break;
        case 'rpg':
            rpg(interaction);
            break;
    }
});

const discordRoutes = () => {
    if (
        DISCORD_ENABLED &&
        ![undefined, 'test'].includes(process.env.NODE_ENV)
    ) {
        client.login(DISCORD_TOKEN as string).catch((e) => {
            console.error(`ERROR: ${e.toString()}`);
        });
    }
};

export default discordRoutes;
