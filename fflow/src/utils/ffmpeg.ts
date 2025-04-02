export enum FFmpegArg {
    INPUT = '-i',
    VIDEO_CODEC = '-c:v',
    AUDIO_CODEC = '-c:a',
    VIDEO_BITRATE = '-b:v',
    AUDIO_BITRATE = '-b:a',
    FORMAT = '-f',
    SEGMENT_DURATION = '-segment_time',
    SEGMENT_FORMAT = '-segment_format',
    HLS_TIME = '-hls_time',
    HLS_PLAYLIST_TYPE = '-hls_playlist_type',
    DASH_INIT_SEG_NAME = '-init_seg_name',
    DASH_MEDIA_SEG_NAME = '-media_seg_name',
    DASH_USE_TEMPLATE = '-use_template',
    DASH_USE_TIMELINE = '-use_timeline',
    LOG_LEVEL = '-loglevel'
}

class FFmpegArgsBuilder {
    private args: string[] = [];

    addArg(key: FFmpegArg, value: string | number | boolean = true): this {
            if (typeof value === 'boolean') {
            if (value) {
                this.args.push(key);
            }
        } else {
            this.args.push(key, value.toString());
        }
        return this;
    }

    addInput(input: string): this {
        return this.addArg(FFmpegArg.INPUT, input);
    }

    addOutput(outputFile: string): this {
        this.args.push(outputFile);
        return this;
    }

    build(): string[] {
        return this.args;
    }
}

export const ffmpegArgsBuilder = () => new FFmpegArgsBuilder();
