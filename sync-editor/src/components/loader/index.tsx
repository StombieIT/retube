import { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import css from './styles.module.styl';

const OFFSET = 130;

export interface LoaderProps extends Pick<HTMLAttributes<HTMLSpanElement>, 'className'> {
    /** [0-100] */
    progress?: number;
}

export const Loader: FC<LoaderProps> = ({ className, progress = 100 }) => {
    const loaderClasses = cn(
        css.loader,
        className,
    );
    const loaderStyles: Record<string, string> = {
        '--loader-progress': String(Math.round(OFFSET - OFFSET * progress / 100)),
    };

    return <span className={loaderClasses} style={loaderStyles}>
        <svg height="60" width="60">
            <circle cx="30" cy="30" r="20" stroke-width="10" fill="none" />
        </svg>
  </span>;
};
