import { BaseResponse, Format } from './common';

export namespace Holder {
    export namespace Upload {
        export namespace Request {
            export interface Register {
                formats: Format[];
            }
        }    
    
        export namespace Response {
            export type Register = BaseResponse;
            export type Unregister = BaseResponse;
        }
    }
}
