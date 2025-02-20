import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Input } from '../input';
import { login, register } from '../../store/auth/slice';

import css from './styles.module.styl';
import { Button } from '../button';

enum AuthModalStage {
    LOGIN = 'login',
    REGISTER = 'register'
}

function getButtonView(active: boolean) {
    if (active) {
        return 'primary';
    }

    return 'ordinary';
}

export const AuthModal: FC = () => {    
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordRepeat, setPasswordRepeat] = useState<string>('');
    const [stage, setStage] = useState<AuthModalStage>(AuthModalStage.LOGIN);
    const dispatch = useDispatch();

    const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();    

        const credentials = {
            email,
            password,
        };        

        switch (stage) {
            case AuthModalStage.LOGIN:
                dispatch(login(credentials));
                break;
            case AuthModalStage.REGISTER:
                dispatch(register(credentials));
                break;
        }
    };

    const isSendButtonDisabled =
        stage === AuthModalStage.REGISTER &&
        (password !== passwordRepeat || !password || !passwordRepeat);

    return (
        <div className={css.container}>
            <form className={css.modal} onSubmit={onSubmit}>
                <div className={css.toggler}>
                    <Button
                        view={getButtonView(stage === AuthModalStage.LOGIN)}
                        type="button"
                        className={css.button}
                        onClick={() => setStage(AuthModalStage.LOGIN)}
                    >
                        Вход
                    </Button>
                    <Button
                        view={getButtonView(stage === AuthModalStage.REGISTER)}
                        type="button"
                        className={css.button}
                        onClick={() => setStage(AuthModalStage.REGISTER)}
                    >
                        Регистрация
                    </Button>
                </div>
                <Input
                    type="email"
                    title="Email"
                    value={email}
                    onChange={(evt) => setEmail(evt.target.value)}
                    wrapperClassname={css.input}
                />
                <Input
                    title="Пароль"
                    type="password"
                    value={password}
                    onChange={(evt) => setPassword(evt.target.value)}
                    wrapperClassname={css.input}
                />
                {stage === AuthModalStage.REGISTER && (
                    <Input
                        title="Повторный пароль"
                        type="password"
                        value={passwordRepeat}
                        onChange={(evt) => setPasswordRepeat(evt.target.value)}
                        wrapperClassname={css.input}
                    />
                )}
                <Button
                    className={css.button}
                    disabled={isSendButtonDisabled}
                >
                    Отправить
                </Button>
            </form>
        </div>
    );
};
