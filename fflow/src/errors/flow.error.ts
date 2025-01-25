export class FlowError extends Error {
    public uploadSessionId: string;

    constructor(uploadSessionId: string, message?: string) {
        super(message);
        this.uploadSessionId = uploadSessionId;
    }
}
