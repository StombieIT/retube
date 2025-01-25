import { FlowError } from './flow.error';

export class FlowNotFoundError extends FlowError {
    constructor(uploadSessionId: string, message?: string) {
        super(uploadSessionId, message);
    }
}
