import { FC, useCallback, useLayoutEffect, useRef, VideoHTMLAttributes } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import dashjs from 'dashjs';
import { selectFlowById } from '../../store/video/selectors';
import { setCanPlay } from '../../store/slot-control/slice';
import { selectToPlay } from '../../store/slot-control/selectors';

import css from './styles.module.styl';

export interface SlotProps
    extends Pick<VideoHTMLAttributes<HTMLVideoElement>, 'className' | 'muted'> {
    flowId: string;
    onClick?: (flowId: string) => void;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onEnded?: () => void;
}

export const Slot: FC<SlotProps> = ({ flowId, className, onClick, onTimeUpdate, ...props }) => {
    const playerRef = useRef<HTMLVideoElement>(null);
    const { distributionUrls } = useSelector(selectFlowById(flowId));
    const toPlay = useSelector(selectToPlay);
    const dispatch = useDispatch();

    const { dash } = distributionUrls;

    useLayoutEffect(() => {
        if (playerRef.current) {
            const onCanPlay = () => {
                dispatch(setCanPlay({ flowId, canPlay: true }));
            };
            playerRef.current.addEventListener('canplaythrough', onCanPlay);

            return () => {
                playerRef.current!.removeEventListener('canplaythrough', onCanPlay);
            };
        }

    }, [flowId]);

    useLayoutEffect(() => {
        if (playerRef.current && onTimeUpdate) {
            const timeUpdateHandler = (evt: Event) => {
                const target = evt.target as HTMLVideoElement;
                if (!isNaN(target.currentTime)) {
                    onTimeUpdate(target.currentTime, target.duration);
                }
            };
            playerRef.current.addEventListener('timeupdate', timeUpdateHandler);

            return () => {
                playerRef.current!.removeEventListener('timeupdate', timeUpdateHandler);
            };
        }

    }, [flowId, onTimeUpdate]);

    useLayoutEffect(() => {
        if (toPlay === null) {
            return;
        }
        if (playerRef.current) {
            if (toPlay) {
                playerRef.current.play();
            } else {
                playerRef.current.pause();
            }
        }
    }, [toPlay]);

    useLayoutEffect(() => {
        if (playerRef.current) {
            const player = dashjs.MediaPlayer().create();
            player.initialize(playerRef.current, dash, false);

            return player.reset;
        }
    }, [dash]);

    const slotClasses = cn(
        css.slot,
        className,
    );

    const onVideoClick = useCallback(() => {
        onClick?.(flowId);
    }, [flowId, onClick]);

    return (
        <div className={slotClasses}>
            <video
                {...props}
                ref={playerRef}
                className="video"
                onClick={onVideoClick}
                autoPlay={false}
            >
            </video>
        </div>
    );
};
