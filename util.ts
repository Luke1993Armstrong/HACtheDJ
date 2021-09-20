import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl, { videoInfo } from "ytdl-core";

export const formatAsCode = (str: string | number): string => {
    return "`" + str.toString() + "`";
};

export const convertSecondsToMinutes = (secondsRaw: string | number): string => {
    const totalSeconds = isNaN(+secondsRaw) ? 0 : +secondsRaw;
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const createAudioResourceForTrack = (
    videoInfo: videoInfo
): AudioResource<null> => {
    const sourceStream = ytdl.downloadFromInfo(videoInfo, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25, // Make the buffer 32MiB; otherwise we get a connResetException
    });
    const resource = createAudioResource(sourceStream);
    return resource;
};
