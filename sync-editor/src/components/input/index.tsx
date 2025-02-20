import { FC, HTMLAttributes, InputHTMLAttributes } from 'react';
import cn from 'classnames';

import css from './styles.module.styl';

export interface InputProps
    extends Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
    title?: string;
    wrapperClassname?: HTMLAttributes<HTMLLabelElement>['className'];
}

export const Input: FC<InputProps> = ({ title, wrapperClassname, ...inputProps }) => {
    const wrapperClasses = cn(
        css.wrapper,
        wrapperClassname,
    );

    return (
        <label className={wrapperClasses}>
            {title && (
                <h5 className={css.header}>
                    {title}
                </h5>
            )}
            <input
                {...inputProps}
                className={css.field}
                placeholder={title}
            />
        </label>
    );
};
