import { FunctionComponent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { selectFlows, selectMainFlowId } from '../../store/video/selectors';
import { Slot } from '../slot';
import { Controls } from '../controls';
import { setIsFullScreenOpened, setStatus, setTime } from '../../store/player/slice';
import { PlayerStatus } from '../../types/player';
import { selectIsFullScreenOpened, selectPlayerStatus } from '../../store/player/selectors';
import { selectIsControlsHideable } from '../../store/config/selectors';
import { setMainFlowId } from '../../store/video/slice';
import { togglePlay } from '../../store/shared/actions';

import css from './styles.module.styl';

const MANIFEST_PATH = '/testing/manifest.mpd';

export const App: FunctionComponent = () => {
    const status = useSelector(selectPlayerStatus);
    const flows = useSelector(selectFlows);
    const mainFlowId = useSelector(selectMainFlowId);
    const isControlsHideable = useSelector(selectIsControlsHideable);
    const isFullScreenOpened = useSelector(selectIsFullScreenOpened);
    const dispatch = useDispatch();

    const containerRef = useRef<HTMLDivElement>(null);
    const [lastWasTouched, setLastWasTouched] = useState<number>(0);
    const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
    const [isFullScreenLoading, setIsFullScreenLoading] = useState<boolean>(false);

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
                        onClick={() => dispatch(togglePlay())}
                    />
                );
                continue;
            }

            regularSlots.push(
                <div className={css.slotWrapper}>
                    <button
                        type="button"
                        className={css.button}
                        onClick={() => dispatch(setMainFlowId(flow.id))}
                    >
                    </button>
                    <Slot
                        key={flow.id}
                        flowId={flow.id}
                        className={css.slot}
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

    useEffect(() => {
        const onFullscreenChange = () => {
            dispatch(setIsFullScreenOpened(Boolean(document.fullscreenElement)));
        };     

        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);
    
    const controlsWrapperClasses = cn(
        css.controlsWrapper,
        {
            [css.__hidden]: !isControlsVisible && isControlsHideable,
        }
    );

    const onClick = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        setLastWasTouched(Date.now());
    }, [])

    const onMouseMove = useCallback(() => {
        setLastWasTouched((lastWasTouched) => lastWasTouched ? Date.now() : lastWasTouched);
    }, []);

    const onFullScreenChangeAttempt = useCallback(() => {
        setIsFullScreenLoading(true);
        if (!isFullScreenLoading) {
            let action: Promise<void>;
            if (isFullScreenOpened) {
                action = document.exitFullscreen();
            } else {
                action = containerRef.current!.requestFullscreen();
            }
            action.finally(() => setIsFullScreenLoading(false));
        }
    }, [isFullScreenOpened, isFullScreenLoading]);

    return (
        <main
            ref={containerRef}
            className={css.container}
            onClick={onClick}
            onMouseMove={onMouseMove}
        >
            {slots}
            <footer className={controlsWrapperClasses}>
                <Controls onFullScreenChangeAttempt={onFullScreenChangeAttempt} />
            </footer>
        </main>
    );
};