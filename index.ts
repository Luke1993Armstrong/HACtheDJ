import { Client, Intents, MessageEmbed } from "discord.js";

import {
    generateDependencyReport as generateDiscordVoiceDependencyReport,
    joinVoiceChannel,
} from "@discordjs/voice";

import * as ytdl from "ytdl-core";
import { HACTheDJ } from "./dj/create";

import { token, prefix } from "./config.json";
import {
    convertSecondsToMinutes,
    createAudioResourceForTrack,
    formatAsCode,
} from "./util";

console.log(generateDiscordVoiceDependencyReport());

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

const DJ = new HACTheDJ();

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

    const runPlayCommand = async (query: string, addToFront = false) => {
        if (!message.guild) {
            return;
        }
        const guildId = message.guild.id;

        if (!query) {
            await message.channel.send("Tell me what to play please!");
            return;
        }

        await message.channel.send(
            `:musical_note: Searching :mag_right: ${"`" + query + "`"}`
        );

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

        if (!DJ.isInitialized(guildId)) {
            const connection = joinVoiceChannel({
                guildId,
                channelId: voiceChannel.id,
                adapterCreator: message.guild?.voiceAdapterCreator,
            });
            console.log(`Joined channel ${voiceChannel.name}`);
            DJ.init(guildId, connection);
        }

        const videoInfo = await ytdl.getInfo(query);
        await message.channel.send(
            `OK!! I'm quwuing ${formatAsCode(videoInfo.videoDetails.title)}...`
        );
        console.log(`Requesting ${videoInfo.videoDetails.video_url}`);

        DJ.queue(
            guildId,
            {
                resource: createAudioResourceForTrack(videoInfo),
                details: videoInfo,
            },
            addToFront
        );

        const reactionEmoji = message.guild.emojis.cache.find(
            (emoji) => emoji.name === Reactions.CarrotApproved
        );
        if (reactionEmoji) {
            await message.react(reactionEmoji);
        }
    };

    const runRemoveCommand = async (index: string) => {
        const i = Number.parseInt(index);
        if (!message.guild || isNaN(i)) {
            return;
        }

        const rm = DJ.removeTrack(message.guild.id, i);
        if (rm) {
            await message.channel.send(`Removed ${formatAsCode(rm.title)}`);
        }
    };

    const runClearCommand = async () => {
        if (!message.guild) {
            return;
        }
        await message.channel.send(
            `${Reactions.Boom} Cleared... ${Reactions.StopButton}`
        );
        DJ.clearQueue(message.guild.id);
    };

    const runNowPlayingCommand = async () => {
        if (!message.guild) {
            return;
        }
        const np = DJ.getNowPlaying(message.guild.id);
        if (np) {
            await message.channel.send(`Now playing: ${np.title}`);
        } else {
            await message.channel.send(`Not playing anything : /`);
        }
    };

    const runViewQueueCommand = async () => {
        if (!message.guild) {
            return;
        }
        const np = DJ.getNowPlaying(message.guild.id);
        const {
            tracksOnPage,
            totalLength,
            totalTracks,
            pageNumber,
            totalPages,
            queueLoopEnabled,
            singleLoopEnabled,
        } = DJ.getQueue(message.guild.id);
        let msg = "Now playing:";
        if (np) {
            msg += `\n${np.title}`;
        }
        msg += "\nUp Next:";
        tracksOnPage.forEach((track, index) => {
            const num = formatAsCode(`${index + 1}. `);
            const title = track.title + " |";
            const duration = convertSecondsToMinutes(track.lengthSeconds);
            msg += `\n${num} ${title} ${formatAsCode(duration)}`;
        });
        msg += `\n${totalTracks} songs in queue | ${convertSecondsToMinutes(
            totalLength
        )} total length`;
        msg += `\nPage ${pageNumber} of ${totalPages} | Loop: ${
            singleLoopEnabled ? Reactions.WhiteCheck : Reactions.X
        } | Queue Loop: ${queueLoopEnabled ? Reactions.WhiteCheck : Reactions.X}`;
        await message.channel.send(msg);
    };

    const runLoopCommand = async () => {
        if (!message.guild) {
            return;
        }
        const enabled = DJ.toggleLoop(message.guild.id);
        await message.channel.send(
            `${Reactions.RepeatOne} **${enabled ? "En" : "Dis"}abled!**`
        );
    };

    const runLoopQueueCommand = async () => {
        if (!message.guild) {
            return;
        }
        const enabled = DJ.toggleLoopQueue(message.guild.id);
        await message.channel.send(
            `${Reactions.Repeat}  **Queue loop ${enabled ? "en" : "dis"}abled!**`
        );
    };

    const runSkipCommand = async () => {
        if (!message.guild) {
            return;
        }
        await message.channel.send(
            `${Reactions.FastForward} Skipped ${Reactions.ThumbsUp}`
        );
        DJ.skip(message.guild.id);
    };

    const runShuffleCommand = async () => {
        if (!message.guild) {
            return;
        }
        DJ.shuffle(message.guild.id);
        await message.channel.send(`**Shuffled queue** ${Reactions.OkHand}`);
    };

    const runMoveCommand = async (indexToMove: string, indexToMoveTo = "1") => {
        if (
            !message.guild ||
            isNaN(Number.parseInt(indexToMove)) ||
            isNaN(Number.parseInt(indexToMoveTo))
        ) {
            return;
        }
        const m = DJ.move(
            message.guild.id,
            Number.parseInt(indexToMove),
            Number.parseInt(indexToMoveTo)
        );
        if (m) {
            await message.channel.send(
                `${Reactions.WhiteCheck} **Moved ${formatAsCode(
                    m.track.title
                )} to position ${m.newPosition + 1}**`
            );
        }
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
    // console.log(`> From '${message.member?.displayName || "(no name"}': ${message.content}`);

    const commandAndParams = message.content.split(" ");
    const command = commandAndParams
        .slice(0, 1)[0]
        ?.substring(prefix.length)
        .toLowerCase(); // trim prefix
    const params = commandAndParams.slice(1);

    switch (command) {
        case Cmd.Test:
            return runTestCommand();
        case Cmd.Play:
        case Cmd.Play2:
            return runPlayCommand(params.join(" "));
        case Cmd.Playtop:
        case Cmd.Playtop2:
            return runPlayCommand(params.join(" "), true);
        case Cmd.Skip:
        case Cmd.Skip2:
            return runSkipCommand();
        case Cmd.Baka:
            return runBakaCommand();
        case Cmd.NowPlaying:
            return runNowPlayingCommand();
        case Cmd.ViewQueue:
        case Cmd.ViewQueue2:
            return runViewQueueCommand();
        case Cmd.ClearQueue:
            return runClearCommand();
        case Cmd.LoopQueue:
            return runLoopQueueCommand();
        case Cmd.LoopSingle:
            return runLoopCommand();
        case Cmd.Remove:
        case Cmd.Remove2:
            return runRemoveCommand(params[0] || "");
        case Cmd.Move:
        case Cmd.Move2:
            return runMoveCommand(params[0] || "", params[1]);
        case Cmd.Disconnect:
        case Cmd.Disconnect2:
        case Cmd.Shuffle:
            return runShuffleCommand();
        case Cmd.Seek:
    }
});

enum Cmd {
    Test = "test",
    Play = "play",
    Play2 = "p",
    Skip = "skip",
    Skip2 = "fs",
    Baka = "baka",
    Playtop = "playtop",
    Playtop2 = "pt",
    NowPlaying = "np",
    ViewQueue = "queue",
    ViewQueue2 = "q",
    ClearQueue = "clear",
    Disconnect = "disconnect",
    Disconnect2 = "dc",
    Shuffle = "shuffle",
    Remove = "remove",
    Remove2 = "rm",
    Seek = "seek",
    LoopSingle = "loop",
    LoopQueue = "loopqueue",
    Move = "move",
    Move2 = "m",
}

enum Reactions {
    CarrotApproved = "carrotApproved",
    Repeat = ":repeat:",
    RepeatOne = ":repeat_one:",
    ThumbsUp = ":thumbsup:",
    FastForward = ":fast_forward:",
    X = ":x:",
    WhiteCheck = ":white_check_mark:",
    StopButton = ":stop_button:",
    Boom = ":boom:",
    OkHand = ":ok_hand:",
}

client.login(token).catch((e) => console.log(e));
