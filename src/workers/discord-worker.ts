import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    Client,
    GatewayIntentBits,
    Guild,
    Partials,
    REST,
    Routes,
    SlashCommandBuilder,
} from 'discord.js';
import { die } from '@common/resources/discord-resources';
import type {
    CheckDiscordVoiceTarget,
    CreateDiscordPlayer,
    DiscordUsernameOptions,
} from '@common/types';
import {
    AudioPlayerStatus,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice';

/*--------------*/
/*    CONFIG    */
/*--------------*/

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
});

/*--------------*/
/*    EVENTS    */
/*--------------*/

const commands = [
    new SlashCommandBuilder()
        .setName('assist')
        .setDescription('You following to assist?'),
    new SlashCommandBuilder()
        .setName('cry')
        .setDescription('Gonna cry?')
        .addUserOption((option) =>
            option.setName('username').setDescription('who?').setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice!')
        .addStringOption((option) =>
            option
                .setName('faces')
                .setDescription('The number of Die faces')
                .setRequired(true)
                .addChoices(
                    { name: '6', value: '6' },
                    { name: '9', value: '9' }
                )
        ),
    new SlashCommandBuilder().setName('rpg').setDescription('Oh no...'),
];

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_ENABLED } = process.env;

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN as string);

if (DISCORD_ENABLED && ![undefined, 'test'].includes(process.env.NODE_ENV)) {
    rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID as string), {
        body: commands,
    })
        .then(() => {
            console.info(`[${new Date()}] Discord Bot commands loaded!`);
        })
        .catch((e) => {
            console.error(`[${new Date()}] ERROR: ${e.message}`);
        });
}

/*--------------*/
/* INTERACTIONS */
/*--------------*/

export const checkVoiceTarget = (
    interaction: ChatInputCommandInteraction<CacheType>
): CheckDiscordVoiceTarget => {
    if (!interaction.guild) {
        throw new Error('Play only works while in a guild!');
    }

    const targetUser = interaction.guild.members.cache.get(interaction.user.id);
    if (!targetUser) {
        throw new Error("Couldn't find you in the server?");
    }

    const targetVoiceChannel = targetUser.voice.channelId;
    if (!targetVoiceChannel) {
        throw new Error('Please join a voice channel!');
    }

    return { targetUser, targetVoiceChannel, guild: interaction.guild };
};

export const createPlayer = (
    guild: Guild,
    targetVoiceChannel: string
): CreateDiscordPlayer => {
    const player = createAudioPlayer();
    const connection = joinVoiceChannel({
        channelId: targetVoiceChannel,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
    });

    if (!connection) {
        throw new Error("Bot couldn't connect to the voice channel.");
    }

    connection.subscribe(player);

    return { connection, player };
};

export const assist = async (
    interaction: ChatInputCommandInteraction<CacheType>
): Promise<void> => {
    try {
        await interaction.reply('https://www.youtube.com/watch?v=CRzfZu0GH14');
    } catch (e: any) {
        await interaction.reply({
            content: `Bot couldn't complete your request at this time. (${e.message})`,
            ephemeral: true,
        });
    }
};

export const cry = async (
    interaction: ChatInputCommandInteraction<CacheType>
): Promise<void> => {
    try {
        const message = interaction.options.data[0] as DiscordUsernameOptions;
        if (message?.user) {
            await interaction.reply({
                content: `${message.user}`,
                embeds: [
                    {
                        image: {
                            url: 'https://media3.giphy.com/media/8JZxZgr39TLczSJQoS/giphy.gif',
                        },
                    },
                ],
                allowedMentions: { parse: ['everyone'] },
            });
        }
    } catch (e: any) {
        await interaction.reply({
            content: `Bot couldn't complete your request at this time. (${e.message})`,
            ephemeral: true,
        });
    }
};

export const roll = async (
    interaction: ChatInputCommandInteraction<CacheType>
): Promise<void> => {
    try {
        const faceCount = interaction.options.data[0].value
            ? parseInt(interaction.options.data[0].value as string)
            : 6;

        const dieArray = die.slice(0, faceCount);
        const randomFace = Math.floor(Math.random() * faceCount);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('ClearDiceRoll')
                .setLabel('Done!')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            content: dieArray[randomFace],
            components: [row],
        });
    } catch (e: any) {
        await interaction.reply({
            content: `Bot couldn't complete your request at this time. (${e.message})`,
            ephemeral: true,
        });
    }
};

export const rpg = async (
    interaction: ChatInputCommandInteraction<CacheType>
): Promise<void> => {
    try {
        const { targetVoiceChannel, guild } = checkVoiceTarget(interaction);

        const { connection, player } = createPlayer(guild, targetVoiceChannel);

        await interaction.reply({ content: 'BOOM!' });

        connection.on(VoiceConnectionStatus.Ready, () => {
            const resource = createAudioResource('./src/common/audio/rpg.mp3');

            resource.volume?.setVolume(1);

            player.play(resource);
            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                interaction.deleteReply();
            });
        });
    } catch (e: any) {
        await interaction.reply({
            content: `Bot couldn't complete your request at this time. (${e.message})`,
            ephemeral: true,
        });
    }
};
