import { FC, ReactNode, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PlayIcon from '../../assets/play.svg?react';
import PauseIcon from '../../assets/pause.svg?react';
import ReloadIcon from '../../assets/reload.svg?react';
import FullscreenOnIcon from '../../assets/fullscreen-on.svg?react';
import FullscreenOffIcon from '../../assets/fullscreen-off.svg?react';
import { selectIsFullScreenOpened, selectPlayerStatus } from '../../store/player/selectors';
import { PlayerStatus } from '../../types/player';
import { pause, play, reload } from '../../store/shared/actions';
import { TimeRange } from '../range/time-range';
import { TimeIndicator } from '../time-indicator';

import css from './styles.module.styl';

interface ButtonOptions {
    icon?: ReactNode;
    onClick?: () => void;
}

export interface ControlsProps {
    onFullScreenChangeAttempt?: () => void;
}

export const Controls: FC<ControlsProps> = ({ onFullScreenChangeAttempt: onFullScreenChange }) => {
    const status = useSelector(selectPlayerStatus);
    const isFullScreenOpened = useSelector(selectIsFullScreenOpened);
    const dispatch = useDispatch();

    const { onClick, icon: mainIcon } = useMemo<ButtonOptions>(() => {
        switch (status) {
            case PlayerStatus.PAUSED:
                return {
                    icon: <PlayIcon />,
                    onClick: () => dispatch(play()),
                };
            case PlayerStatus.FINISHED:
                return {
                    icon: <ReloadIcon />,
                    onClick: () => dispatch(reload()),
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
            <div className={css.controlsWrapper}>
                <div className={css.leftPanel}>
                    <button
                        type="button"
                        className={css.button}
                        onClick={onClick}
                    >
                        {mainIcon}
                    </button>
                    <TimeIndicator />
                </div>
                <div className={css.rightPanel}>
                    <button
                        type="button"
                        className={css.button}
                        onClick={onFullScreenChange}
                    >
                        {isFullScreenOpened ? (
                            <FullscreenOffIcon />
                        ) : (
                            <FullscreenOnIcon />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
