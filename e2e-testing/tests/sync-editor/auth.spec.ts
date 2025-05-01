import { expect, test } from '@playwright/test';
import { AuthModal } from '../../pages/sync-editor/auth-modal';
import { v4 as uuid } from 'uuid';

const {
    USER_EMAIL,
    USER_PASSWORD,
} = process.env;

test.describe('Аутентификация/Авторизация', () => {
    test('вход с помощью тестовых данных', async ({ page }) => {
        expect(USER_EMAIL, 'Email должен быть задан').toBeDefined();
        expect(USER_PASSWORD, 'Пароль должен быть задан').toBeDefined();

        const authModal = new AuthModal(page);

        await authModal.open();
        await authModal.switchToLogIn();
        await authModal.fillEmail(USER_EMAIL!);
        await authModal.fillEmail(USER_PASSWORD!);
        const authorizedPage = await authModal.submit();

        // Модальное окно должно быть скрыто в результате авторизации и открываться страница самого приложения
        expect(authorizedPage, 'Модальное окно скрывается').toBeDefined();
    });

    test('успешная регистрация и вход', async ({ page }) => {        
        const email = `${uuid()}@${uuid()}.${uuid()}`;
        const password = uuid();

        const authModal = new AuthModal(page);

        // Регистрация
        await authModal.open();
        await authModal.switchToRegister();
        await authModal.fillEmail(email);
        await authModal.fillPassword(password);
        await authModal.fillPasswordRepeat(password);
        await authModal.submit();

        // Вход
        await authModal.switchToLogIn();
        const authorizedPage = await authModal.submit();

        // Модальное окно должно быть скрыто в результате авторизации и открываться страница самого приложения
        expect(authorizedPage, 'Модальное окно скрывается').toBeDefined();
    });
});
