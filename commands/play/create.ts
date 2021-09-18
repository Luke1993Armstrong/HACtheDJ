import {
    PartialTextBasedChannelFields,
} from 'discord.js';

export const createPlayCommandHandler = ({
    sendMessage,
}: {
    sendMessage: PartialTextBasedChannelFields["send"],
}) => {
    return (query: string) => {
        if(!query) {
            sendMessage(`Tell me what to play please!`);
            return;
        }

        sendMessage(`OwO hewwo! I see you want to play ${query} but I don't work yet! :D`);
    };
};