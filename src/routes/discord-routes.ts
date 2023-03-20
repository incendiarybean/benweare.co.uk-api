import { ActivityType } from "discord.js";
import { assist, client, cry, roll, rpg } from "@workers/discord-worker";

const { DISCORD_TOKEN, DISCORD_ENABLED } = process.env;

client.on("ready", () => {
    console.log(
        `[${new Date()}] Discord Bot ${client.user?.tag} has logged in!`
    );

    if (client.user) {
        client.user.setActivity("sitting here and taking it...", {
            type: ActivityType.Competing,
        });
    }
});

/**
 * This block handles direct messages to the bot
 */
client.on("messageCreate", async (interaction) => {
    if (!interaction.content) return;

    // TODO: Do something cool here!
});

/**
 * This block handles button commands to the bot
 */
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    switch (interaction.customId) {
        case "ClearDiceRoll":
            try {
                await interaction.message.delete();
            } catch (e) {
                interaction.reply({
                    content:
                        "Dimiss button has already been clicked, dismiss me!",
                    ephemeral: true,
                });
            }
            break;
    }
});

/**
 * This block handles slash commands to the bot
 */
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.commandName) {
        case "assist":
            assist(interaction);
            break;
        case "cry":
            cry(interaction);
            break;
        case "roll":
            roll(interaction);
            break;
        case "rpg":
            rpg(interaction);
            break;
    }
});

const discordRoutes = () => {
    if (DISCORD_ENABLED) {
        client.login(DISCORD_TOKEN as string).catch((e) => {
            console.log(`ERROR: ${e.toString()}`);
        });
    }
};

export default discordRoutes;
