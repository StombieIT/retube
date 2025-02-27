import { PlayerStatus } from '../../types/player';
import { setStatus, setTime } from '../player/slice';

export function onTimeupdate(evt: Event) {
    const target = evt.currentTarget as HTMLVideoElement;

    window.store.dispatch(setTime({
        currentTime: target.currentTime,
        duration: target.duration,
    }));
}

export function onEnded() {
    window.store.dispatch(setStatus(PlayerStatus.FINISHED));
}

export function doSeek(video: HTMLVideoElement, time: number) {
    return new Promise<void>(resolve => {
        let canPlay = false;
        let seeked = false;

        const handleEvt = () => {
            if (canPlay && seeked) {
                resolve();
            }
        };  

        video.addEventListener('seeked', () => {
            seeked = true;
            handleEvt();
        }, { once: true });
        video.addEventListener('canplaythrough', () => {
            canPlay = true;
            handleEvt();
        }, { once: true });

        video.currentTime = time;
    });
}
