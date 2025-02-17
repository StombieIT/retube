import { FC, useEffect, useState } from 'react';

import css from './styles.module.styl';
import cn from 'classnames';
import { Loader } from '../loader';

export interface CandidateProps {
    video?: Blob;
    onVideoDropped?: (video: Blob) => void;
    onDelete?: () => void;
    progress?: number;
}

export const Candidate: FC<CandidateProps> = ({
    video,
    onVideoDropped,
    onDelete,
    progress,
}) => {
    const [videoUrl, setVideoUrl] = useState<Maybe<string>>();
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const isUploadingDisabled = Boolean(video);

    const handleFileList = (fileList: FileList) => {
        const videoFiles = Array.from(fileList)
            .filter(file => file.type.startsWith('video/'));
        if (!videoFiles.length) {
            return;
        }
        
        const video = videoFiles[0];
        onVideoDropped?.(video);
    };

    const onDrop = (evt: React.DragEvent<HTMLLabelElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
        
        if (isUploadingDisabled) {
            return;
        }

        handleFileList(evt.dataTransfer.files);
    };

    const onDragOver = (evt: React.DragEvent<HTMLLabelElement>) => {
        evt.preventDefault();
        setIsDragOver(true);
    };

    const onDragLeave = (evt: React.DragEvent<HTMLLabelElement>) => {
        setIsDragOver(false);
    };

    const onInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if (evt.target.files) {
            handleFileList(evt.target.files);
        }
    };

    useEffect(() => {
        if (video) {
            onVideoDropped?.(video);

            const blobVideoUrl = URL.createObjectURL(video);
            setVideoUrl(blobVideoUrl);

            return () => {
                setVideoUrl(undefined);
                URL.revokeObjectURL(blobVideoUrl)
            };
        }
    }, [video]);

    const dropAreaClasses = cn(
        css.dropArea,
        {
            [css.__disabled]: isUploadingDisabled,
            [css.__dragOver]: isDragOver,
        }
    );

    const isWaitingUpload = !video && Boolean(onVideoDropped);
    const isInProgress = typeof progress == 'number';

    return (
        <div className={cn(css.candidateWrapper, 'candidate')}>
            {onVideoDropped && (
                <button type="button" className={css.deleteButton} onClick={onDelete}>
                    Удалить
                </button>
            )}
            {videoUrl && (
                <div className={css.videoWrapper}>
                    <video
                        className={css.video}
                        src={videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                    </video>
                </div>
            )}
            {isInProgress && (
                <div className={css.loaderContainer}>
                    <Loader
                        className={css.loader}
                        progress={progress}
                    />
                </div>
            )}
            {isWaitingUpload && (
                <label
                    className={dropAreaClasses}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <input
                        type="file"
                        className={css.input}
                        onChange={onInputChange}
                        disabled={isUploadingDisabled}
                    />
                    Загрузите видео
                </label>
            )}
        </div>
    );
};