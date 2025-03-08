import { FC } from 'react';
import { useSelector } from 'react-redux';
import { selectPlayerUrl } from '../../store/distribution/selectors';
import Copy from '../../assets/icons/copy.svg?react';
import { Logo } from '../logo';
import { MainField } from '../main-field';
import { copyToClipboard } from '../../helpers';

import css from './styles.module.styl';

export const Distribution: FC = () => {
    const playerUrl = useSelector(selectPlayerUrl);
    const playerIframe = `<iframe src="${playerUrl}" allowfullscreen></iframe>`;

    return (
        <main className={css.wrapper}>
            <Logo className={css.logo} />
            <h3 className={css.header}>Теперь вы можете использовать плеер!</h3>
            <MainField
                type="static"
                staticContent={playerUrl}
                rightSlot={
                    <button
                        type="button"
                        className={css.copyButton}
                        onClick={() => copyToClipboard(playerUrl)}
                    >
                        <Copy />
                    </button>
                }
            />
            <MainField
                type="static"
                staticContent={playerIframe}
                rightSlot={
                    <button
                        type="button"
                        className={css.copyButton}
                        onClick={() => copyToClipboard(playerIframe)}
                    >
                        <Copy />
                    </button>
                }
            />
            <iframe src={playerUrl} className={css.player} allowFullScreen></iframe>
        </main>
    );
};
