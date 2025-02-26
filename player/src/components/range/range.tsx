import { FC, HTMLAttributes } from 'react';

import css from './styles.module.styl';

export interface RangeProps
    extends Pick<HTMLAttributes<HTMLDivElement>, 'onMouseMove' | 'onMouseLeave'> {
    fact?: number;
    desirable?: number;
}

export const Range: FC<RangeProps> = ({
    fact = 0,
    desirable = 0,
    onMouseMove,
    onMouseLeave,
}) => {
    const rangeStyles: Record<string, string> = {
        '--fact-progress': `${fact}%`,
        '--desirable-progress': `${desirable}%`,
    };    

    return (
        <div
            className={css.range}
            style={rangeStyles}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            <div className={css.line}>
                <div className={css.barWrapper}></div>
                <div className={css.thumb}></div>
            </div>
        </div>
    );
};