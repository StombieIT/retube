import { registerAs } from '@nestjs/config';

export const FFmpegConfig = registerAs('ffmpeg', () => ({
  videoCodec: process.env.FFMPEG_VIDEO_CODEC,
  audioCodec: process.env.FFMPEG_AUDIO_CODEC,
  videoBitrate: process.env.FFMPEG_VIDEO_BITRATE,
  audioBitrate: process.env.FFMPEG_AUDIO_BITRATE,
  segmentDuration: parseInt(process.env.FFMPEG_SEGMENT_DURATION, 10),
  segmentFormat: process.env.FFMPEG_SEGMENT_FORMAT,
}));
