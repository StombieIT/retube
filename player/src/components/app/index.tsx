import { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { selectFlows, selectMainFlowId } from '../../store/video/selectors';
import { Slot } from '../slot';
import { Controls } from '../controls';
import { setStatus, setTime } from '../../store/player/slice';
import { PlayerStatus } from '../../types/player';
import { selectPlayerStatus } from '../../store/player/selectors';
import { selectIsControlsHideable } from '../../store/config/selectors';

import css from './styles.module.styl';

const MANIFEST_PATH = '/testing/manifest.mpd';

export const App: FunctionComponent = () => {
    const status = useSelector(selectPlayerStatus);
    const flows = useSelector(selectFlows);
    const mainFlowId = useSelector(selectMainFlowId);
    const isControlsHideable = useSelector(selectIsControlsHideable);
    const dispatch = useDispatch();
    const [lastWasTouched, setLastWasTouched] = useState<number>(0);
    const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);

    useEffect(() => {
        if (lastWasTouched) {
            setIsControlsVisible(true);
            const timer = setTimeout(() => setIsControlsVisible(false), 3000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [lastWasTouched]);

    useEffect(() => {
        if (status === PlayerStatus.FINISHED) {
            setIsControlsVisible(true);
        }
    }, [status]);

    const onTimeUpdate = useCallback((currentTime: number, duration: number) => {
        dispatch(setTime({
            currentTime,
            duration,
        }));
    }, []);

    const onEnded = useCallback(() => {
        dispatch(setStatus(PlayerStatus.FINISHED));
    }, []);

    const isLoading = !flows.length || !mainFlowId;

    const slots = (() => {
        if (isLoading) {
            return;
        }

        const regularSlots = [] as ReactNode[];
        let mainSlot: ReactNode;

        for (const flow of flows) {
            if (flow.id === mainFlowId) {
                mainSlot = (
                    <Slot
                        className={css.mainSlot}
                        flowId={flow.id}
                        onTimeUpdate={onTimeUpdate}
                        onEnded={onEnded}
                    />
                );
                continue;
            }

            regularSlots.push(
                <div className={css.slot}>
                    <button type="button" className={css.button}>
                    </button>
                    <Slot
                        key={flow.id}
                        flowId={flow.id}
                        muted
                    />
                </div>
            );
        }

        if (!mainSlot) {
            return;
        }

        
        return (
            <>
                {Boolean(regularSlots.length) && (
                    <div className={css.regularSlots}>
                        {regularSlots}
                    </div>
                )}
                {mainSlot}
            </>
        );
    })();
    
    const controlsWrapperClasses = cn(
        css.controlsWrapper,
        {
            [css.__hidden]: !isControlsVisible && isControlsHideable,
        }
    );

    const onClick = useCallback(() => {
        setLastWasTouched(Date.now());
    }, [])

    const onMouseMove = () => {
        if (lastWasTouched) {
            setLastWasTouched(Date.now());
        }
    };

    return (
        <main
            className={css.container}
            onClick={onClick}
            onMouseMove={onMouseMove}
        >
            {slots}
            <footer className={controlsWrapperClasses}>
                <Controls />
            </footer>
        </main>
    );
};