import { expect, test } from '@playwright/test';
import { AuthModal } from '../../pages/sync-editor/auth-modal';
import { v4 as uuid } from 'uuid';

const {
    USER_EMAIL,
    USER_PASSWORD,
} = process.env;

test.describe('Аутентификация/Авторизация', () => {
    test('ui формы входа', async ({ page }) => {
        const authModal = new AuthModal(page);

        await authModal.open();
        await authModal.switchToLogIn();

        const form = authModal.getForm();
        await expect(form).toHaveScreenshot('login.png');
    });
    
    test('ui формы регистрации', async ({ page }) => {
        const authModal = new AuthModal(page);
        
        await authModal.open();
        await authModal.switchToRegister();

        const form = authModal.getForm();
        await expect(form).toHaveScreenshot('register.png');
    });

    test('вход с помощью тестовых данных', async ({ page }) => {
        expect(USER_EMAIL, 'Email должен быть задан').toBeTruthy();
        expect(USER_PASSWORD, 'Пароль должен быть задан').toBeTruthy();

        const authModal = new AuthModal(page);

        await authModal.open();
        await authModal.switchToLogIn();
        await authModal.fillEmail(USER_EMAIL!);
        await authModal.fillPassword(USER_PASSWORD!);
        const authorizedPage = await authModal.submit();

        expect(authorizedPage, 'Модальное окно скрывается').toBeTruthy();
    });

    test('вход и выход', async ({ page }) => {
        let authModal: AuthModal | null = new AuthModal(page);

        await authModal.open();
        await authModal.switchToLogIn();
        await authModal.fillEmail(USER_EMAIL!);
        await authModal.fillPassword(USER_PASSWORD!);
        const authorizedPage = await authModal.submit();

        expect(authorizedPage, 'Модальное окно скрывается').toBeTruthy();

        authModal = await authorizedPage!.logOut();

        expect(authModal, 'Модальное окно открывается при выходе').toBeTruthy();
    });

    test('успешная регистрация и вход', async ({ page }) => {        
        const email = `${uuid()}@${uuid()}.${uuid()}`;
        const password = uuid();

        const authModal = new AuthModal(page);

        await authModal.open();
        await authModal.switchToRegister();
        await authModal.fillEmail(email);
        await authModal.fillPassword(password);
        await authModal.fillPasswordRepeat(password);
        await authModal.submit();

        await authModal.switchToLogIn();
        const authorizedPage = await authModal.submit();

        expect(authorizedPage, 'Модальное окно скрывается').toBeTruthy();
    });
});
