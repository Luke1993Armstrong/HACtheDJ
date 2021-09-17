import { Client, Intents } from 'discord.js';

const authConfig: {token: string} = require('./auth.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('OwO hewo');
});

client.login(authConfig.token);
