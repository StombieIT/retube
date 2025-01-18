import { FunctionComponent, useLayoutEffect, useRef } from 'react';
import dashjs from 'dashjs';

import css from './styles.module.styl';

console.log('css', css);

const MANIFEST_PATH = '/testing/manifest.mpd';

export const App: FunctionComponent = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useLayoutEffect(() => {
        if (videoRef.current) {
            const player = dashjs.MediaPlayer().create();
            player.initialize(videoRef.current, MANIFEST_PATH, true);
        }
    }, []);

    return (
        <main className={css['container']}>
            <video ref={videoRef} controls></video>
        </main>
    );
};