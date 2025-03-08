import { FC } from 'react';
import { DynamicMainFieldProps, StaticMainFieldProps } from './types';
import { StaticMainField } from './static-main-field';
import { DynamicMainField } from './dynamic-main-field';

interface DeterminedStaticMainFieldProps extends StaticMainFieldProps {
    type: 'static';
}

interface DeterminedDynamicMainFieldProps extends DynamicMainFieldProps {
    type: 'dynamic';
}

export type MainFieldProps = DeterminedStaticMainFieldProps | DeterminedDynamicMainFieldProps;

export const MainField: FC<MainFieldProps> = (props) => {
    const content = (() => {
        switch (props.type) {
            case 'dynamic':
                return <DynamicMainField {...props} />;
            case 'static':
                return <StaticMainField {...props} />;
        }
    })();

    return content;
};