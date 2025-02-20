import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import cn from 'classnames';

import css from './styles.module.styl';

export interface ButtonProps
    extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className' | 'onClick' | 'disabled'>,
        PropsWithChildren {
    view?: 'primary' | 'ordinary';
    rounded?: boolean;
}

export const Button: FC<ButtonProps> = ({
    className,
    view = 'primary',
    rounded = true,
    ...props
}) => {
    const buttonClasses = cn(
        css.button,
        css[`__view-${view}`],
        {
            [css.__rounded]: rounded,
        },
        className,
    );

    return (
        <button {...props} className={buttonClasses} />
    );
};