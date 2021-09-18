import {
    MessageEmbed,
    PartialTextBasedChannelFields,
} from 'discord.js';

export const createTestCommandHandler = ({
    sendMessage,
}: {
    sendMessage: PartialTextBasedChannelFields["send"],
}) => {
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

    return () => {
        sendMessage({embeds: [embed]});
    };
};
