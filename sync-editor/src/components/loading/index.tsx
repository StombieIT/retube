import { FC } from 'react';
import { Loader } from '../loader';

import css from './styles.module.styl';

export const Loading: FC = () => {
    return (
        <div className={css.loadingWrapper}>
            <Loader />
        </div>
    );
};