import { FC, useCallback, useLayoutEffect, useRef, VideoHTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import dashjs from 'dashjs';
import { selectFlowById } from '../../store/video/selectors';

import css from './styles.module.styl';

export interface SlotProps
    extends Pick<VideoHTMLAttributes<HTMLVideoElement>, 'className' | 'muted'> {
    flowId: string;
    onClick?: (flowId: string) => void;
}

export const Slot: FC<SlotProps> = ({ flowId, className, onClick, ...props }) => {
    const playerRef = useRef<HTMLVideoElement>(null);
    const { distributionUrls } = useSelector(selectFlowById(flowId));
    const { dash } = distributionUrls;

    useLayoutEffect(() => {
        if (playerRef.current) {
            const player = dashjs.MediaPlayer().create();
            player.initialize(playerRef.current, dash, true);

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
        <video
            {...props}
            ref={playerRef}
            className={slotClasses}
            onClick={onVideoClick}
        >
        </video>
    );
};
