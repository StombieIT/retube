export namespace FFlow {
    export namespace Response {
        interface BaseResponse {
            status: 'success' | 'error';
            message: string;
        }     

        export interface Create extends BaseResponse {
            pushLink: string;
        }

        export type Delete = BaseResponse;
        export type Push = BaseResponse;
    }
}
