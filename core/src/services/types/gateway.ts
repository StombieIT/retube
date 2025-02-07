import { BaseResponse, PayloadResponse } from './common';

export namespace Gateway {
    interface UserPayload {
        email: string;
        password: string;
    }

    export interface OAuthTokens {
        refreshToken: string;
        accessToken: string;
    }

    export namespace Request {
        export type Register = UserPayload;
        export type Login = UserPayload;
    }

    export namespace Response {
        export type Register = BaseResponse;
        export type Login = PayloadResponse<OAuthTokens>;
    }
}
