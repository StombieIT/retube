import { Flow, UploadSession, User, Video } from '../../db/entities';
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

    export interface WithRefreshToken extends Pick<OAuthTokens, 'refreshToken'> {
    }

    type VideoBase = Pick<Video, 'title' | 'description'>;
    type FlowBase = Pick<Flow, 'id' | 'status'>

    export interface VideoPayload extends VideoBase {
        totalBytesList: number[];
    }

    export type SmallUser = Pick<User, 'id' | 'email' | 'createdAt'>;

    export type SmallUploadSession = Pick<UploadSession, 'id' | 'totalBytes' | 'uploadedBytes'>

    export interface SmallFlow extends FlowBase {
        uploadSession?: SmallUploadSession;
        distributionUrls?: Record<Format, string>;
    }

    export interface SmallVideo extends VideoBase, Pick<Video, 'id' | 'status'> {
        flows: SmallFlow[];
        uploadedAt?: number;
    }

    export namespace Request {
        export type Register = UserPayload;
        export type Login = UserPayload;
        export type Refresh = WithRefreshToken;
        export type CreateVideo = VideoPayload;
    }

    export namespace Response {
        export type Register = BaseResponse;
        export type Login = PayloadResponse<OAuthTokens>;
        export type Refresh = PayloadResponse<OAuthTokens>;
        export type CreateVideo = PayloadResponse<SmallVideo>;
        export type Upload = BaseResponse;
        export type State = PayloadResponse<SmallVideo>;
        export type Me = PayloadResponse<SmallUser>;
    }
}
