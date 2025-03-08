import { ButtonHTMLAttributes, FC, PropsWithChildren, ReactNode } from 'react';
import cn from 'classnames';

import css from './styles.module.styl';

export interface ButtonProps
    extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className' | 'onClick' | 'disabled'>,
        PropsWithChildren {
    view?: 'primary' | 'ordinary';
    rounded?: boolean;
    leftSlot?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
    className,
    view = 'primary',
    rounded = true,
    children,
    leftSlot,
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
        <button {...props} className={buttonClasses}>
            {leftSlot}
            {children}
        </button>
    );
};