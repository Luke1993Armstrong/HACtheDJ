import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    VoiceConnection,
} from "@discordjs/voice";
import { MoreVideoDetails, videoInfo } from "ytdl-core";
import { createAudioResourceForTrack } from "../util";

export type Track = {
    resource: AudioResource;
    details: videoInfo;
};

type GuildId = string;
type DJContext = {
    audioPlayer: AudioPlayer;
    queue: Track[];
    currentTrackDetails?: videoInfo;
    queueLoopEnabled?: boolean;
    singleLoopEnabled?: boolean;
};

interface QueueDetails {
    tracksOnPage: MoreVideoDetails[];
    totalTracks: number;
    totalPages: number;
    totalLength: number;
    pageNumber: number;
    singleLoopEnabled?: boolean;
    queueLoopEnabled?: boolean;
}

const DISPLAYED_TRACKS = 20;

export class HACTheDJ {
    private contexts = new Map<GuildId, DJContext>();

    getContext(guild: GuildId): DJContext {
        const context = this.contexts.get(guild);
        if (!context) {
            throw new Error(`No context set up for guild ${guild}`);
        }
        return context;
    }

    processQueue(context: DJContext, isSkip = false): void {
        const {
            audioPlayer,
            queue,
            currentTrackDetails: details,
            singleLoopEnabled,
            queueLoopEnabled,
        } = context;
        if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
            // if there's a current track, handle it if we're looping a track or the queue
            if (details) {
                if (singleLoopEnabled && !isSkip) {
                    // if we're looping the same song, add it back to the start
                    queue.unshift({
                        details,
                        resource: createAudioResourceForTrack(details),
                    });
                } else if (queueLoopEnabled) {
                    // if we're looping the queue, add the song to the end of the queue
                    queue.push({
                        details,
                        resource: createAudioResourceForTrack(details),
                    });
                }
            }

            const track = queue.shift();
            if (track) {
                audioPlayer.play(track.resource);
            }

            context.currentTrackDetails = track?.details;
        }
    }

    removeTrack(guild: GuildId, index: number): MoreVideoDetails | undefined {
        const context = this.getContext(guild);
        // reduce the index by 1, because normal people dont go `rm 0`,
        // so we need to account for them using `rm 1`
        index -= 1;
        if (index > -1 && index < context.queue.length && context.queue.length > 0) {
            return context.queue.splice(index, 1)[0]?.details.videoDetails;
        }
        return undefined;
    }

    clearQueue(guild: GuildId): void {
        const context = this.getContext(guild);
        context.queue.splice(0);
    }

    toggleLoop(guild: GuildId): boolean {
        const context = this.getContext(guild);
        context.singleLoopEnabled = !context.singleLoopEnabled;
        return context.singleLoopEnabled;
    }

    toggleLoopQueue(guild: GuildId): boolean {
        const context = this.getContext(guild);
        context.queueLoopEnabled = !context.queueLoopEnabled;
        return context.queueLoopEnabled;
    }

    getQueue(guild: GuildId, pageNumber = 0): QueueDetails {
        const { queue, queueLoopEnabled, singleLoopEnabled } = this.getContext(guild);
        const allTracks = queue.map((t) => t.details);
        let totalLength = 0;
        // probably could just keep track of this instead of calculating it every time
        for (const t of allTracks) {
            const currentLength = +t.videoDetails.lengthSeconds;
            totalLength += isNaN(currentLength) ? 0 : currentLength;
        }
        const index = pageNumber * DISPLAYED_TRACKS;
        const totalTracks = allTracks.length;
        const deets: QueueDetails = {
            queueLoopEnabled,
            singleLoopEnabled,
            totalTracks,
            pageNumber: Math.max(Math.ceil((index + 1) / DISPLAYED_TRACKS), 1),
            tracksOnPage: allTracks
                .slice(index, index + DISPLAYED_TRACKS)
                .map((t) => t.videoDetails),
            totalLength,
            totalPages: Math.ceil(totalTracks / DISPLAYED_TRACKS),
        };
        return deets;
    }

    getNowPlaying(guildId: GuildId): MoreVideoDetails | undefined {
        return this.getContext(guildId).currentTrackDetails?.videoDetails;
    }

    isInitialized(guild: GuildId): boolean {
        return this.contexts.has(guild);
    }

    init(guild: GuildId, connection: VoiceConnection): void {
        const audioPlayer = createAudioPlayer();

        const context: DJContext = {
            audioPlayer,
            queue: [],
        };

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.processQueue(context);
        });

        connection.subscribe(audioPlayer);

        this.contexts.set(guild, context);
    }

    queue(guild: GuildId, track: Track, addToFront = false): void {
        const context = this.getContext(guild);
        if (addToFront) {
            context.queue.unshift(track);
        } else {
            context.queue.push(track);
        }
        this.processQueue(context);
    }

    skip(guild: GuildId): void {
        const context = this.getContext(guild);
        context.audioPlayer.stop(true);
        this.processQueue(context, true);
    }

    shuffle(guild: GuildId): void {
        const context = this.getContext(guild);
        context.queue.sort(() => Math.random() - 0.5);
    }

    move(guild: GuildId, indexToMove: number, indexToMoveTo = 1): MovedTrack | undefined {
        const context = this.getContext(guild);
        const length = context.queue.length;
        indexToMoveTo = (indexToMoveTo <= length ? indexToMoveTo : length) - 1;
        indexToMove -= 1;
        if (
            indexToMove < context.queue.length &&
            indexToMove >= 0 &&
            indexToMoveTo < context.queue.length &&
            indexToMoveTo >= 0
        ) {
            indexToMoveTo;
            const tempTrack = context.queue[indexToMoveTo];
            const tomove = context.queue[indexToMove];
            if (tempTrack && tomove) {
                context.queue[indexToMoveTo] = tomove;
                context.queue[indexToMove] = tempTrack;

                return {
                    newPosition: indexToMoveTo,
                    track: tomove?.details.videoDetails,
                };
            }
        }

        return undefined;
    }
}

interface MovedTrack {
    track: MoreVideoDetails;
    newPosition: number;
}
