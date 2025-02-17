import { FC } from 'react';
import { useSelector } from 'react-redux';
import { selectUploadingFlows } from '../../store/upload/selectors';
import { Candidate } from '../candidate';
import { useVideoManager } from '../../managers/video-manager/react';

import css from './styles.module.styl';

export const Uploading: FC = () => {    
    const flows = useSelector(selectUploadingFlows);
    const videoManager = useVideoManager();

    const candidates = flows.map((flow) => {
        const uploadSession = flow.uploadSession;
        const progress = uploadSession
            ? Math.round(uploadSession.uploadedBytes * 100 / uploadSession.totalBytes)
            : undefined;

        return (
            <Candidate
                key={flow.id}
                video={videoManager.getVideoById(flow.id)}
                progress={progress}
            />
        );
    });

    return (
        <main className={css.wrapper}>
            <h2 className={css.header}>Загружаем видео</h2>
            {candidates}
        </main>
    );
};
