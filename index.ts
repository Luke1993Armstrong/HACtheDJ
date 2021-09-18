import {
    Client,
    Intents,
    MessageEmbed,
} from 'discord.js';

const {
    token,
    prefix,
}: {
    token: string,
    prefix: string
} = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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
});

client.login(token);
