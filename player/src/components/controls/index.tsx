import { FC, ReactNode, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PlayIcon from '../../assets/play.svg?react';
import PauseIcon from '../../assets/pause.svg?react';
import ReloadIcon from '../../assets/reload.svg?react';

import css from './styles.module.styl';
import { selectPlayerStatus } from '../../store/player/selectors';
import { PlayerStatus } from '../../types/player';
import { pause, play } from '../../store/shared/actions';
import { TimeRange } from '../range/time-range';

interface ButtonOptions {
    icon?: ReactNode;
    onClick?: () => void;
}

export const Controls: FC = () => {
    const status = useSelector(selectPlayerStatus);
    const dispatch = useDispatch();

    const { onClick, icon } = useMemo<ButtonOptions>(() => {
        switch (status) {
            case PlayerStatus.PAUSED:
                return {
                    icon: <PlayIcon />,
                    onClick: () => dispatch(play()),
                };
            case PlayerStatus.FINISHED:
                return {
                    icon: <ReloadIcon />,
                    onClick: () => {},
                };
            default:
                return {
                    icon: <PauseIcon />,
                    onClick: () => dispatch(pause()),
                };
        }
    }, [status]);

    return (
        <div className={css.wrapper}>
            <TimeRange />
            <div className={css.buttons}>
                <button
                    type="button"
                    className={css.button}
                    onClick={onClick}
                >
                    {icon}
                </button>
            </div>
        </div>
    );
};
