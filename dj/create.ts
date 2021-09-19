import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    VoiceConnection,
} from "@discordjs/voice";

export type Track = {
    resource: AudioResource,
};

type guildId = string;
type DJContext = {
    audioPlayer: AudioPlayer,
    queue: Track[],
};

export const createDJ = () => {
    const contexts = new Map<guildId, DJContext>();

    const getContext = (guild: guildId): DJContext => {
        const context = contexts.get(guild);
        if(!context) {
            throw new Error(`No context set up for guild ${guild}`);
        }
        return context;
    };

    const processQueue = (context: DJContext) => {
        if(context.audioPlayer.state.status === AudioPlayerStatus.Idle) {
            const track = context.queue.shift();
            if(track) {
                context.audioPlayer.play(track.resource);
            }
        }
    };

    const isInitialized = (guild: guildId) => {
        return contexts.has(guild);
    };

    const init = (guild: guildId, connection: VoiceConnection) => {
        const audioPlayer = createAudioPlayer();

        const context: DJContext = {
            audioPlayer,
            queue: [],
        };

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            processQueue(context);
        });

        connection.subscribe(audioPlayer);

        contexts.set(guild, context);
    };

    const queue = (guild: guildId, track: Track) => {
        const context = getContext(guild);
        context.queue.push(track);
        processQueue(context);
    };

    const skip = (guild: guildId) => {
        const context = getContext(guild);
        context.audioPlayer.stop(true);
        processQueue(context);
    };

    return {
        isInitialized,
        init,
        queue,
        skip,
    };
};