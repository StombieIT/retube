import { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Range } from './range';
import { selectDuration, selectPlayerTime } from '../../store/player/selectors';
import { getProgressByEvent } from '../helpers';
import { seek as doSeek } from '../../store/shared/actions';
import { round } from '../../helpers';

export const TimeRange: FC = () => {
    const currentTime = useSelector(selectPlayerTime);
    const duration = useSelector(selectDuration);
    const [seek, setSeek] = useState<number>(0);
    const [desiredProgress, setDesiredProgress] = useState<number | null>(null);
    const [isMouseEnter, setIsMouseEnter] = useState<boolean>(false);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const dispatch = useDispatch();

    const relativeProgress = desiredProgress ?? (Math.round(currentTime * 100 / duration) || 0);

    useEffect(() => {
        if (!isMouseDown) {
            setDesiredProgress(null);
        }
    }, [isMouseDown, currentTime]);

    const onMouseMove = useCallback((evt: MouseEvent, element: HTMLElement) => {
        const progress = Math.max(
            0,
            Math.min(Math.round(getProgressByEvent(evt, element)), 100),
        );
        setSeek(isMouseEnter ? progress : 0);
        if (isMouseDown) {
            setDesiredProgress(progress);
        }
    }, [isMouseDown, isMouseEnter]);

    const onMouseLeave = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        setIsMouseEnter(false);
        setSeek(0);
    }, []);

    const onMouseUp = useCallback((evt: MouseEvent, element: HTMLElement) => {
        if (isMouseEnter) {
            const progress = Math.max(
                0,
                Math.min(getProgressByEvent(evt, element), 100),
            );
            dispatch(doSeek(round(duration * progress / 100, 2)));
            setIsMouseDown(false);
        }
    }, [isMouseEnter, duration]);

    const onMouseDown = useCallback(() => {
        setIsMouseDown(true);
    }, []);

    const onMouseEnter = useCallback(() => {
        setIsMouseEnter(true);
    }, []);

    return (
        <Range
            fact={relativeProgress}
            desirable={seek}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
        />
    );
};