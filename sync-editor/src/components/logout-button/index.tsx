import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../button';
import { logout } from '../../store/auth/slice';
import CloseIcon from '../../assets/icons/close.svg?react';

import css from './styles.module.styl';

export const LogoutButton: FC = () => {
    const dispatch = useDispatch();    

    const onClick = () => {
        dispatch(logout());
    };  

    return (
        <Button
            view="primary"
            className={css.logoutButton}
            leftSlot={<CloseIcon />}
            onClick={onClick}
        >
            Выход
        </Button>
    );
};
