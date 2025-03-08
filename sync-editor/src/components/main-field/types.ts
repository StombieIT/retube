import { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

interface MainFieldPropsBase
    extends Pick<HTMLAttributes<HTMLElement>, 'className'> {
    rightSlot?: ReactNode;
}

export interface StaticMainFieldProps extends MainFieldPropsBase {
    staticContent: string;
}

export interface DynamicMainFieldProps
    extends MainFieldPropsBase,
        Pick<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
    type: 'dynamic';
    content: string;
    onChangeContent: (content: string) => void;
}
