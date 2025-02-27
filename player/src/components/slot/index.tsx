import { FC, useLayoutEffect, useRef, HTMLAttributes } from 'react';
import cn from 'classnames';
import { useVideo } from '../../managers/video-manager/react';

import css from './styles.module.styl';

export interface SlotProps
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'onClick'> {
    flowId: string;
}

export const Slot: FC<SlotProps> = ({ flowId, className, ...props }) => {
    const playerRef = useRef<HTMLDivElement>(null);
    const video = useVideo(flowId);

    useLayoutEffect(() => {
        if (playerRef.current) {
            playerRef.current.appendChild(video!.getVideoElement());

            return () => {
                playerRef.current?.removeChild(video!.getVideoElement());
            };
        }
    }, [video]);

    const slotClasses = cn(
        css.slot,
        className,
    );

    return (
        <div {...props} className={slotClasses} ref={playerRef}>
        </div>
    );
};
