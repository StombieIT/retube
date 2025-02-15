import { FC, useEffect, useState } from 'react';

import css from './styles.module.styl';
import cn from 'classnames';

export interface CandidateProps {
    onVideoDropped?: (video: Blob) => void;
    onDelete?: () => void;
}

export const Candidate: FC<CandidateProps> = ({ onVideoDropped, onDelete }) => {
    const [video, setVideo] = useState<Maybe<Blob>>();
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
        setVideo(video);
    };

    const onDrop = (evt: React.DragEvent<HTMLLabelElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
        
        if (isUploadingDisabled) {
            return;
        }
        const videoFiles = Array.from(evt.dataTransfer.files)
            .filter(file => file.type.startsWith('video/'));
        if (!videoFiles.length) {
            return;
        }
        
        const video = videoFiles[0];
        setVideo(video);
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

    return (
        <div className={cn(css.candidateWrapper, 'candidate')}>
            <button type="button" className={css.deleteButton} onClick={onDelete}>
                Удалить
            </button>
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
        </div>
    );
};