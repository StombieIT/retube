import { BaseResponse } from './common';

export namespace FFlow {
    export interface FinishParams {
        savingPath: string;
    }

    export namespace Request {
        export interface Finish extends FinishParams {
        }
    }

    export namespace Response {
        export interface Create extends BaseResponse {
            flowUrl: string;
        }

        export type Delete = BaseResponse;
        export type Push = BaseResponse;
        export type Finish = BaseResponse;
    }

    export type FFmpegFormat = 'dash' | 'hls';
}
