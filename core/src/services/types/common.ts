export interface BaseResponse {
    status: 'success' | 'error';
    message: string;
}

export type Format = 'dash' | 'hls';
