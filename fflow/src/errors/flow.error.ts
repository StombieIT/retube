import { UploadSessionId } from '@stombie/retube-core';

export class FlowError extends Error {
    public uploadSessionId: UploadSessionId;

    constructor(uploadSessionId: UploadSessionId, message?: string) {
        super(message);
        this.uploadSessionId = uploadSessionId;
    }
}
