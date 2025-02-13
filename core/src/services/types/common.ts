export interface BaseResponse {
    status: 'success' | 'error';
    message?: string;
}

export interface PayloadResponse<T extends {}> extends BaseResponse {
    payload?: T;
}

export type Format = 'dash' | 'hls';
