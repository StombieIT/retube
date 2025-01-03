export namespace FFlow {
    export namespace Response {
        interface BaseResponse {
            status: 'success' | 'error';
            message: string;
        }     

        export interface Create extends BaseResponse {
            flowUrl: string;
        }

        export type Delete = BaseResponse;
        export type Push = BaseResponse;
        export type Finish = BaseResponse;
    }
}
