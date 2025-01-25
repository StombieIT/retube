import { FlowError } from './flow.error';

export class FlowAlreadyExistsError extends FlowError {
    constructor(uploadSessionId: string, message?: string) {
        super(uploadSessionId, message);
    }
}
