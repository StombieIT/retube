import { registerAs } from '@nestjs/config';

export const FFmpegConfig = registerAs('ffmpeg', () => ({
    videoCodec: process.env.FFMPEG_VIDEO_CODEC,
    audioCodec: process.env.FFMPEG_AUDIO_CODEC,
    videoBitrate: process.env.FFMPEG_VIDEO_BITRATE,
    audioBitrate: process.env.FFMPEG_AUDIO_BITRATE,
    dashSegmentDuration: parseInt(process.env.FFMPEG_DASH_SEGMENT_DURATION, 10),
    dashSegmentFormat: process.env.FFMPEG_DASH_SEGMENT_FORMAT,
    hlsTime: parseInt(process.env.FFMPEG_HLS_TIME, 10),
    hlsPlaylistType: process.env.FFMPEG_HLS_PLAYLIST_TYPE,
    manifestFilename: process.env.FFMPEG_MANIFEST_FILENAME
}));
