export class NotFoundError extends Error {
    public sessionId: string;

    constructor(sessionId: string, message?: string) {
        super(message);
        this.sessionId = sessionId;
    }
}
