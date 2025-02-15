class VideoManager extends EventTarget {
    private readonly map = new Map<string, Blob>();

    constructor() {
        super();
    }

    addVideo(id: string, video: Blob) {
        console.log('here');
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

    isVideoExistsById(id: string) {
        return this.map.has(id);
    }

    private emitUpdate() {
        this.dispatchEvent(new CustomEvent('update'));
    }
}

export const videoManager = new VideoManager();
