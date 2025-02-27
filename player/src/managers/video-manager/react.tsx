import React, { FC, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid';
import { PropsWithChildren, useContext } from 'react';
import { videoManager } from './manager';

const VideoManagerContext = React.createContext(videoManager);

export const VideoManagerProvider: FC<PropsWithChildren> = ({ children }) =>
    <VideoManagerContext.Provider value={videoManager}>
        {children}
    </VideoManagerContext.Provider>

const INITIAL_REVISION = 'zero-revision'

export const useVideoManager = () => {
    const manager = useContext(VideoManagerContext);
    const [, setRevision] = useState<string>(INITIAL_REVISION);

    useEffect(() => {
        const onUpdate = () => {
            setRevision(uuid());
        };        

        manager.addEventListener('update', onUpdate);

        return () => {
            manager.removeEventListener('update', onUpdate);
        };
    }, []);

    return manager;
};

export const useVideo = (id: string) => {
    const manager = useVideoManager();

    return manager.getVideoById(id);
};
