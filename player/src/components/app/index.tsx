import { FunctionComponent } from 'react';
import cn from 'classnames';
import { useSelector } from 'react-redux';
import { selectFlows, selectMainFlowId } from '../../store/video/selectors';
import { Slot } from '../slot';
import { Controls } from '../controls';

import css from './styles.module.styl';

const MANIFEST_PATH = '/testing/manifest.mpd';

export const App: FunctionComponent = () => {
    const flows = useSelector(selectFlows);
    const mainFlowId = useSelector(selectMainFlowId);

    const isLoading = !flows.length || !mainFlowId;

    const content = (() => {
        if (isLoading) {
            return;
        }

        const slots = flows.map((flow) => {  
            const isMainFlow = mainFlowId === flow.id;
            const slotClasses = cn(
                css.slot,
                {
                    [css.__main]: isMainFlow,
                },
            );

            return (
                <Slot
                    key={flow.id}
                    flowId={flow.id}
                    className={slotClasses}
                    muted={!isMainFlow}
                />
            );
        });

        return (
            <>
                <Controls />
                {slots}
            </>
        );
    })();


    return (
        <main className={css.container}>
            {content}
        </main>
    );
};