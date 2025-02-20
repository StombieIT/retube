import { Gateway } from '@stombie/retube-core';

export interface OAuthTokens {
    refreshToken: string;
    accessToken: string;
}

export function isOAuthTokens(obj: unknown): obj is OAuthTokens {
    return !!obj && typeof obj === 'object' &&
        'refreshToken' in obj &&
        typeof obj.refreshToken === 'string' &&
        'accessToken' in obj &&
        typeof obj.accessToken === 'string';
}

export type AuthCredentials = Gateway.Request.Login;

export type UpdateTokensPayload = Partial<OAuthTokens>;
