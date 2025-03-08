import { FC, HTMLAttributes } from 'react';
import cn from 'classnames';
import PlayIcon from '../../assets/icons/play.svg?react';

import css from './styles.module.styl';

export interface LogoProps
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
}

export const Logo: FC<LogoProps> = ({ className }) => {
    const logoClasses = cn(
        css.wrapper,
        className,
    );

    return (
        <div className={logoClasses}>
            <PlayIcon />
            <span className={css.text}>
                Retube
            </span>
        </div>
    );
};