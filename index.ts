import {
    Client,
    Intents,
    MessageEmbed,
} from 'discord.js';

import {
    generateDependencyReport as generateDiscordVoiceDependencyReport,
    joinVoiceChannel,
} from "@discordjs/voice";

const {
    token,
    prefix,
}: {
    token: string,
    prefix: string
} = require('./config.json');

console.log(generateDiscordVoiceDependencyReport());

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
] });

client.once('ready', () => {
	console.log('OwO hewo');
});
client.once('reconnecting', () => {
    console.log('Reconnecting ...');
});
client.once('disconnect', () => {
    console.log('Disconnect');
});

client.on("messageCreate", async (message) => {
    if(message.author.bot) {
        return;
    }
    if(!message.content.startsWith(prefix)) {
        return;
    }

    const runTestCommand = () => {
        const embed = new MessageEmbed()
            .setColor("#5599EE")
            .setTitle("OwO Hewwo")
            .setDescription("I've come to avenge S.L's death!!!")
            .setThumbnail("https://ddoodm.com//gen/images/misc/sl.jpg")
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
            )
            .setTimestamp()
            .setFooter("Bla bla some footer");

        message.channel.send({embeds: [embed]});
    };

    const runPlayCommand = (query: string) => {
        if(!query) {
            message.channel.send("Tell me what to play please!");
            return;
        }

        if(!message.guild) {
            message.channel.send("You're not in a server?");
            return;
        }

        const voiceChannel = message.member?.voice.channel;

        if(!voiceChannel) {
            message.channel.send("You need to be in a voice channel to play things! >:|");
            return;
        }

        if(!voiceChannel.joinable) {
            message.channel.send(`Voice channel ${voiceChannel.name} isn't joinable?`);
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild?.voiceAdapterCreator,
        });
    };

    const commandAndParams = message.content.split(" ");
    const command = commandAndParams.slice(0, 1)[0].substring(prefix.length); // trim prefix
    const params = commandAndParams.slice(1);

    switch(command) {
        case "test":
            return runTestCommand();
        case "play":
        case "p":
            return runPlayCommand(params.join(" "));
    }
});

client.login(token);
