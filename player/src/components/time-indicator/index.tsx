import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectDuration, selectPlayerTime } from '../../store/player/selectors';
import { secondsToTime } from '../helpers';

import css from './styles.module.styl';

export const TimeIndicator: FC = () => {
    const currentTime = useSelector(selectPlayerTime);
    const duration = useSelector(selectDuration);

    const durationTime = useMemo(
        () => secondsToTime(duration),
        [duration]
    );

    return (
        <div className={css.time}>
            {secondsToTime(currentTime)} / {durationTime}
        </div>
    );
};
