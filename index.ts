import { Client, Intents } from 'discord.js';

const {
    token,
    prefix
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

    message.channel.send(`OwO hewo ${message.author.username}`);
});

client.login(token);
