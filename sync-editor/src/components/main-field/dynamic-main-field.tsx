import { FC, useCallback } from 'react';
import { DynamicMainFieldProps } from './types';
import cn from 'classnames';

import css from './styles.module.styl';

export const DynamicMainField: FC<DynamicMainFieldProps> = ({
    rightSlot,
    placeholder,
    content,
    onChangeContent,
    className,
}) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        onChangeContent(evt.target.value);
    }, [onChangeContent]);

    const fieldClasses = cn(
        css.field,
        className,
    );

    return (
        <label className={fieldClasses}>
            <input
                className={css.content}
                value={content}
                onChange={onChange}
                placeholder={placeholder}
            />
            {rightSlot}
        </label>
    );
};
