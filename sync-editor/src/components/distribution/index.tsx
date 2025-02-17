import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectPlayerUrl } from '../../store/distribution/selectors';
import Copy from '../../assets/icons/copy.svg?react';

import css from './styles.module.styl';

export const Distribution: FC = () => {
    const playerUrl = useSelector(selectPlayerUrl);

    const onCopyClick = useCallback(() => {
        if (!navigator.clipboard) {
            return;
        }

        navigator.clipboard.writeText(playerUrl);
    }, [playerUrl]);

    return (
        <main className={css.wrapper}>
            <h3 className={css.header}>Теперь вы можете использовать плеер!</h3>
            <div className={css.playerLink}>
                <span className={css.link}>
                    {playerUrl}
                </span>
                <button
                    type="button"
                    className={css.copyButton}
                    onClick={onCopyClick}
                >
                    <Copy />
                </button>
            </div>
        </main>
    );
};
