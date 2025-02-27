import { FC, HTMLAttributes, useLayoutEffect, useRef } from 'react';
import cn from 'classnames';

import css from './styles.module.styl';

export interface RangeProps
    extends Pick<HTMLAttributes<HTMLDivElement>,
        'onMouseLeave' |
        'onMouseDown' |
        'onMouseEnter' |
        'className'
    > {
    fact?: number;
    desirable?: number;
    onMouseMove?: (evt: MouseEvent, element: HTMLElement) => void;
    onMouseUp?: (evt: MouseEvent, element: HTMLElement) => void;
}

export const Range: FC<RangeProps> = ({
    fact = 0,
    desirable = 0,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    className,
}) => {
    const rangeRef = useRef<HTMLDivElement>(null);    

    const rangeStyles: Record<string, string> = {
        '--fact-progress': `${fact}%`,
        '--desirable-progress': `${desirable}%`,
    };

    const rangeClasses = cn(
        css.range,
        className,
    );

    useLayoutEffect(() => {
        if (onMouseUp || onMouseMove) {
            function mouseMoveHandler(evt: MouseEvent) {
                onMouseMove?.(evt, rangeRef.current!);
            }
    
            function mouseUpHandler(evt: MouseEvent) {
                onMouseUp?.(evt, rangeRef.current!);
                dispose();
            }
    
            function dispose() {
                window.removeEventListener('mousemove', mouseMoveHandler);
                if (onMouseMove) {
                    window.removeEventListener('mouseup', mouseUpHandler);
                }
            }

            window.addEventListener('mouseup', mouseUpHandler);
            if (onMouseMove) {
                window.addEventListener('mousemove', mouseMoveHandler);
            }
    
            return dispose;
        }
    }, [onMouseUp, onMouseMove]);

    return (
        <div
            className={rangeClasses}
            style={rangeStyles}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            ref={rangeRef}
        >
            <div className={css.line}>
                <div className={css.barWrapper}></div>
                <div className={css.thumb}></div>
            </div>
        </div>
    );
};