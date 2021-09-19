import { Client, Intents, MessageEmbed } from "discord.js";

import {
    createAudioResource,
    generateDependencyReport as generateDiscordVoiceDependencyReport,
    joinVoiceChannel,
} from "@discordjs/voice";

import * as ytdl from "ytdl-core";
import { createDJ } from "./dj/create";

import { token, prefix } from "./config.json";

console.log(generateDiscordVoiceDependencyReport());

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

const DJ = createDJ();

client.once("ready", () => {
    console.log("OwO hewo");
});
client.once("reconnecting", () => {
    console.log("Reconnecting ...");
});
client.once("disconnect", () => {
    console.log("Disconnect");
});

client.on("messageCreate", async (message) => {
    const runTestCommand = async () => {
        const embed = new MessageEmbed()
            .setColor("#5599EE")
            .setTitle("OwO Hewwo")
            .setDescription("I've come to avenge S.L's death!!!")
            .setThumbnail("https://ddoodm.com//gen/images/misc/sl.jpg")
            .addFields({
                name: "Regular field title",
                value: "Some value here",
            })
            .setTimestamp()
            .setFooter("Bla bla some footer");

        await message.channel.send({ embeds: [embed] });
    };

    const runPlayCommand = async (query: string) => {
        if (!message.guild) {
            return;
        }
        const guildId = message.guild.id;

        if (!query) {
            await message.channel.send("Tell me what to play please!");
            return;
        }

        const voiceChannel = message.member?.voice.channel;

        if (!voiceChannel) {
            await message.channel.send(
                "You need to be in a voice channel to play things! >:|"
            );
            return;
        }

        if (!voiceChannel.joinable) {
            await message.channel.send(
                `Voice channel ${voiceChannel.name} isn't joinable?`
            );
        }

        const videoInfo = await ytdl.getInfo(query);
        await message.channel.send(`OK!! I'm quwuing ${videoInfo.videoDetails.title}...`);
        console.log(`Requesting ${videoInfo.videoDetails.video_url}`);

        const connection = joinVoiceChannel({
            guildId,
            channelId: voiceChannel.id,
            adapterCreator: message.guild?.voiceAdapterCreator,
        });
        console.log(`Joined channel ${voiceChannel.name}`);

        if (!DJ.isInitialized(guildId)) {
            DJ.init(guildId, connection);
        }

        const sourceStream = ytdl.downloadFromInfo(videoInfo, {
            filter: "audioonly",
            quality: "highestaudio",
        });
        const resource = createAudioResource(sourceStream);
        DJ.queue(guildId, { resource });

        const reactionEmoji = message.guild.emojis.cache.find(
            (emoji) => emoji.name === "carrotApproved"
        );
        if (reactionEmoji) {
            await message.react(reactionEmoji);
        }
    };

    const runSkipCommand = () => {
        if (!message.guild) {
            return;
        }
        return DJ.skip(message.guild.id);
    };

    const runBakaCommand = async () => {
        await message.channel.send("yes, its Harrison");
    };

    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }
    if (!message.guild) {
        await message.channel.send("You're not in a server?");
        return;
    }
    console.log(`> From '${message.member?.nickname || "(no name"}': ${message.content}`);

    const commandAndParams = message.content.split(" ");
    const command = commandAndParams.slice(0, 1)[0]?.substring(prefix.length); // trim prefix
    const params = commandAndParams.slice(1);

    switch (command) {
        case "test":
            return runTestCommand();
        case "play":
        case "p":
            return runPlayCommand(params.join(" "));
        case "skip":
            return runSkipCommand();
        case "baka":
            return runBakaCommand();
    }
});

client.login(token).catch((e) => console.log(e));
