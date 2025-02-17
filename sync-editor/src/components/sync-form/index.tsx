import { FC } from 'react';
import { v4 as uuid } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { selectFlowCandidates } from '../../store/flow-candidates/selectors';
import { addCandidate, addCandidateVideoAction, deleteCandidateByIdAction } from '../../store/flow-candidates/slice';
import { Candidate } from '../candidate';
import { useVideoManager } from '../../managers/video-manager/react';

import css from './styles.module.styl';
import { startUpload } from '../../store/shared/actions';

export const SyncForm: FC = () => {
    const candidates = useSelector(selectFlowCandidates);
    const videoManager = useVideoManager();
    const dispatch = useDispatch();

    const flowsContent = candidates.map(candidateId => (
        <Candidate
            key={candidateId}
            video={videoManager.getVideoById(candidateId)}
            onVideoDropped={video => dispatch(addCandidateVideoAction({ candidateId, video }))}
            onDelete={() => dispatch(deleteCandidateByIdAction(candidateId))}
        />
    ));

    const allCandidatesHaveVideo = candidates.every(candidateId => videoManager.getVideoById(candidateId) instanceof Blob);

    const onAddFlow = () => {
        dispatch(addCandidate(uuid()));
    };

    const onUpload = () => {
        dispatch(startUpload());
    };

    return (
        <div className={css.form}>
            {Boolean(flowsContent.length) && (
                <div className={css.flows}>
                    {flowsContent}
                </div>
            )}
            <div className={css.buttons}>
                <button type="button" className={css.button} onClick={onAddFlow}>
                    Добавить поток
                </button>
                {Boolean(candidates.length) && (
                    <button
                        type="button"
                        className={css.button}
                        onClick={onUpload}
                        disabled={!allCandidatesHaveVideo}
                    >
                        Загрузить
                    </button>
                )}
            </div>
        </div>
    );
};