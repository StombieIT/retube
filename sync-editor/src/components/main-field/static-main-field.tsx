import { FC } from 'react';
import cn from 'classnames';
import { StaticMainFieldProps } from './types';

import css from './styles.module.styl';

export const StaticMainField: FC<StaticMainFieldProps> = ({ className, staticContent, rightSlot }) => {
    const fieldClasses = cn(
        css.field,
        className
    );    

    return (
        <div className={fieldClasses}>
            <span className={css.content}>
                {staticContent}
            </span>
            {rightSlot}
        </div>
    );
};
