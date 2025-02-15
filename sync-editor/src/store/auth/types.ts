export interface OAuthTokens {
    refreshToken: string;
    accessToken: string;
}

export type UpdateTokensPayload = Partial<OAuthTokens>;
