import { FC, HTMLAttributes, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import HighIcon from '../../assets/volume/high.svg?react';
import LowIcon from '../../assets/volume/low.svg?react';
import NoneIcon from '../../assets/volume/none.svg?react';
import MutedIcon from '../../assets/volume/muted.svg?react';
import { Range } from '../range/range';
import { selectIsMuted, selectVolume } from '../../store/player/selectors';
import { toggleSound } from '../../store/shared/actions';

import css from './styles.module.styl';
import { getProgressByEvent } from '../helpers';
import { setVolume } from '../../store/player/slice';

export interface VolumeControlProps
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
}

export const VolumeControl: FC<VolumeControlProps> = ({
    className,
}) => {
    const isMuted = useSelector(selectIsMuted);
    const volume = useSelector(selectVolume);
    const dispatch = useDispatch();

    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [isMouseEnter, setIsMouseEnter] = useState<boolean>(false);

    const icon = (() => {
        if (isMuted) {
            return <MutedIcon />;
        }
        if (!volume) {
            return <NoneIcon />;
        }
        if (volume < 50) {
            return <LowIcon />;
        }
        return <HighIcon />;
    })();

    const controlClasses = cn(
        css.controlWrapper,
        className,
    );

    const onSoundClick = useCallback(() => {
        dispatch(toggleSound());
    }, []);

    const onMouseMove = useCallback((evt: MouseEvent, element: HTMLElement) => {
        if (isMouseDown) {
            const progress = Math.max(
                0,
                Math.min(Math.round(getProgressByEvent(evt, element)), 100),
            )
            dispatch(setVolume(progress));
        }
    }, [isMouseDown]);

    const onMouseUp = useCallback((evt: MouseEvent, element: HTMLElement) => {
        if (isMouseDown || isMouseEnter) {
            const progress = Math.max(
                0,
                Math.min(Math.round(getProgressByEvent(evt, element)), 100),
            );
            dispatch(setVolume(progress));
        }
        setIsMouseDown(false);
    }, [isMouseEnter, isMouseDown]);

    const onMouseDown = useCallback(() => {
        setIsMouseDown(true);
    }, []);

    const onMouseEnter = useCallback(() => {
        setIsMouseEnter(true);
    }, []);

    const onMouseLeave = useCallback(() => {
        setIsMouseEnter(false);
    }, []);

    return (
        <div className={controlClasses}>
            <button
                type="button"
                className={css.button}
                onClick={onSoundClick}
            >
                {icon}
            </button>
            <Range
                className={css.range}
                fact={volume}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
        </div>
    );
};