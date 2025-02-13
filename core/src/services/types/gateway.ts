import { Flow, UploadSession, Video } from '../../db/entities';
import { BaseResponse, Format, PayloadResponse } from './common';

export namespace Gateway {
    interface UserPayload {
        email: string;
        password: string;
    }

    export interface OAuthTokens {
        refreshToken: string;
        accessToken: string;
    }

    type VideoBase = Pick<Video, 'title' | 'description' | 'duration'>;
    type FlowBase = Pick<Flow, 'id' | 'status'>

    export interface VideoPayload extends VideoBase {
        totalBytesList: number[];
    }

    export type SmallUploadSession = Pick<UploadSession, 'id' | 'totalBytes' | 'uploadedBytes'>

    export interface SmallFlow extends FlowBase {
        uploadSession?: SmallUploadSession;
        distributionUrls?: Record<Format, string>;
    }

    export interface SmallVideo extends VideoBase, Pick<Video, 'id' | 'status'> {
        flows: SmallFlow[];
    }

    export namespace Request {
        export type Register = UserPayload;
        export type Login = UserPayload;
        export type CreateVideo = VideoPayload;
    }

    export namespace Response {
        export type Register = BaseResponse;
        export type Login = PayloadResponse<OAuthTokens>;
        export type CreateVideo = SmallVideo;
        export type Upload = BaseResponse;
        export type State = PayloadResponse<SmallVideo>;
    }
}
