import { FC } from 'react';
import { v4 as uuid } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { selectFlowCandidates } from '../../store/flow-candidates/selectors';
import { addCandidate, addCandidateVideoAction, deleteCandidateByIdAction } from '../../store/flow-candidates/slice';
import { Candidate } from '../candidate';
import { useVideoManager } from '../../managers/video-manager/react';
import { startUpload } from '../../store/shared/actions';
import { Button } from '../button';
import { Logo } from '../logo';
import UploadIcon from '../../assets/icons/upload.svg?react';
import { MainField } from '../main-field';
import { selectVideoDescription, selectVideoTitle } from '../../store/video/selectors';
import { updateDescription, updateTitle } from '../../store/video/slice';

import css from './styles.module.styl';

const MAXIMUM_CANDIDATES_COUNT = 4;

export const SyncForm: FC = () => {
    const candidates = useSelector(selectFlowCandidates);
    const title = useSelector(selectVideoTitle);
    const description = useSelector(selectVideoDescription);
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

    const onTitleChange = (title: string) => {
        dispatch(updateTitle(title));
    };

    const onDescriptionChange = (description: string) => {
        dispatch(updateDescription(description));
    };

    const isUploadDisabled = !allCandidatesHaveVideo || !title.length || !description.length;

    return (
        <div className={css.form}>
            <Logo className={css.logo} />
            <MainField
                type="dynamic"
                className={css.field}
                placeholder="Заголовок видео"
                content={title}
                onChangeContent={onTitleChange}
            />
            <MainField
                type="dynamic"
                className={css.field}
                placeholder="Описание видео"
                content={description}
                onChangeContent={onDescriptionChange}
            />
            {flowsContent.length ? (
                <div className={css.flows}>
                    {flowsContent}
                </div>
            ) : (
                <div className={css.motivationText}>
                    Загрузите свое видео в несколько потоков
                </div>
            )}
            <div className={css.buttons}>
                <Button
                    view="ordinary"
                    type="button"
                    onClick={onAddFlow}
                    leftSlot={<UploadIcon />}
                    disabled={candidates.length >= MAXIMUM_CANDIDATES_COUNT}
                >
                    Добавить поток
                </Button>
                {Boolean(candidates.length) && (
                    <Button
                        view="ordinary"
                        type="button"
                        className={css.button}
                        onClick={onUpload}
                        disabled={isUploadDisabled}
                    >
                        Загрузить
                    </Button>
                )}
            </div>
        </div>
    );
};