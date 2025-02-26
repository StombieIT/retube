import { FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Range } from './range';
import { selectDuration, selectPlayerTime } from '../../store/player/selectors';

export const TimeRange: FC = () => {
    const currentTime = useSelector(selectPlayerTime);
    const duration = useSelector(selectDuration);
    const [seek, setSeek] = useState<number>(0);

    const relativeProgress = Math.round(currentTime * 100 / duration) || 0;

    const onMouseMove = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        const progressRect = evt.currentTarget.getBoundingClientRect();
        const progressLeft = progressRect.left;
        const progressWidth = progressRect.width;
        const timeInPx = evt.clientX - progressLeft;
        setSeek(Math.round(timeInPx * 100 / progressWidth) || 0);
    }, []);

    const onMouseLeave = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        setSeek(0);
    }, []);

    return (
        <Range
            fact={relativeProgress}
            desirable={seek}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
        />
    );
};