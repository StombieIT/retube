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
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const dispatch = useDispatch();

    const relativeProgress = desiredProgress ?? (Math.round(currentTime * 100 / duration) || 0);

    useEffect(() => {
        if (!isMouseDown) {
            setDesiredProgress(null);
        }
    }, [isMouseDown, currentTime]);

    const onMouseMove = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        const progress = Math.round(getProgressByEvent(evt));
        setSeek(progress);
        if (isMouseDown) {
            setDesiredProgress(progress);
        }
    }, [isMouseDown]);

    const onMouseLeave = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        setSeek(0);
    }, []);

    const onMouseUp = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        const progress = getProgressByEvent(evt);
        dispatch(doSeek(round(duration * progress / 100, 2)));
        setIsMouseDown(false);
    }, [duration]);

    const onMouseDown = useCallback(() => {
        setIsMouseDown(true);
    }, []);

    return (
        <Range
            fact={relativeProgress}
            desirable={seek}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
        />
    );
};