import { FC } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import { selectIsAuthenticated } from '../../store/auth/selectors';
import { SyncForm } from '../sync-form';
import { selectStage } from '../../store/stage/selectors';
import { Stage } from '../../types/app';

import css from './styles.module.css';

export const App: FC = () => {    
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const stage = useSelector(selectStage);

    if (!isAuthenticated) {
        return null;
    }

    const content = (() => {
        switch (stage) {
            case Stage.SYNCHRONIZING:
                return <SyncForm />;
        }
    })();

    return (
        <div className={cn(css.wrapper, css.themeCommon)}>
            {content}
        </div>
    );
};
