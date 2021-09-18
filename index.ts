import {
    Client,
    Intents,
} from 'discord.js';
import { createCommandHandler } from './commands/command_handler';

import {
    createCommandParser,
} from "./commands/command_parser";

import {
    createTestCommandHandler,
} from "./commands/test/create";
import {
    createPlayCommandHandler
} from './commands/play/create';

const {
    token,
    prefix,
}: {
    token: string,
    prefix: string
} = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const parseCommand = createCommandParser(prefix);

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

    const command = parseCommand(message);
    if(!command) {
        return;
    }
    
    const runTestCommand = createTestCommandHandler({
        sendMessage: (options) => message.channel.send(options),
    });
    const runPlayCommand = createPlayCommandHandler({
        sendMessage: (options) => message.channel.send(options),
    });
    const handleCommand = createCommandHandler({
        runTestCommand,
        runPlayCommand,
    });

    handleCommand(command);
});

client.login(token);
