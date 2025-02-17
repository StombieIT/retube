class VideoManager extends EventTarget {
    private readonly map = new Map<string, Blob>();

    constructor() {
        super();
    }

    addVideo(id: string, video: Blob) {
        this.map.set(id, video);
        this.emitUpdate();
    }

    removeVideoById(id: string) {
        this.map.delete(id);
        this.emitUpdate();
    }

    getVideoById(id: string) {
        return this.map.get(id);
    }

    transferVideo(fromId: string, toId: string) {
        const video = this.map.get(fromId);
        if (!video) {
            return;
        }
        this.map.set(toId, video);
        this.map.delete(fromId);
        this.emitUpdate();
    }

    isVideoExistsById(id: string) {
        return this.map.has(id);
    }

    private emitUpdate() {
        this.dispatchEvent(new CustomEvent('update'));
    }
}

export const videoManager = new VideoManager();
