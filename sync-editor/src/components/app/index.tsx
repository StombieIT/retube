import { FC } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import { selectIsAuthenticated } from '../../store/auth/selectors';
import { SyncForm } from '../sync-form';
import { selectStage } from '../../store/stage/selectors';
import { Loading } from '../loading';
import { Stage } from '../../types/app';
import { Uploading } from '../uploading';
import { Distribution } from '../distribution';
import { AuthModal } from '../auth-modal';

import css from './styles.module.css';

export const App: FC = () => {    
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const stage = useSelector(selectStage);

    const content = (() => {
        switch (stage) {
            case Stage.SYNCHRONIZING:
                return <SyncForm />;
            case Stage.LOADING:
                return <Loading />;
            case Stage.UPLOADING:
                return <Uploading />;
            case Stage.DISTRIBUTION:
                return <Distribution />;
        }
    })();

    return (
        <div className={cn(css.wrapper, css.themeCommon)}>
            {content}
            {!isAuthenticated && (
                <AuthModal />
            )}
        </div>
    );
};
