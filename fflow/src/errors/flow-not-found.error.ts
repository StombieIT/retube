import { UploadSessionId } from '@stombie/retube-core';
import { FlowError } from './flow.error';

export class FlowNotFoundError extends FlowError {
    constructor(uploadSessionId: UploadSessionId, message?: string) {
        super(uploadSessionId, message);
    }
}
