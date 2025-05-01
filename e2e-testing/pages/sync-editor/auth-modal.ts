import { Locator, Page } from '@playwright/test';
import { SynchronizingPage } from './synchronizing-page';
import { AuthorizedPage } from './authorized-page';

const LOG_IN_BUTTON_TEXT = 'Вход';
const REGISTER_BUTTON_TEXT = 'Регистрация';
const EMAIL_PLACEHOLDER = 'Email';
const PASSWORD_PLACEHOLDER = 'Пароль';
const PASSWORD_REPEAT_PLACEHOLDER = 'Повторный пароль';
const SUBMIT_BUTTON_TEXT = 'Отправить';

export class AuthModal {
    private readonly page: Page;
    private readonly logInButton: Locator;
    private readonly registerButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logInButton = page.getByText(LOG_IN_BUTTON_TEXT);
        this.registerButton = page.getByText(REGISTER_BUTTON_TEXT);
    }

    getForm(): Locator {
        return this.page.locator('form');
    }

    async open() {
        await this.page.goto('/');
    }

    async switchToLogIn() {
        await this.logInButton.click();
    }

    async switchToRegister() {
        await this.registerButton.click();
    }

    async fillEmail(email: string) {
        await this.page.getByPlaceholder(EMAIL_PLACEHOLDER).fill(email);
    }

    async fillPassword(password: string) {
        await this.page.getByPlaceholder(PASSWORD_PLACEHOLDER, { exact: true }).fill(password);
    }

    async fillPasswordRepeat(passwordRepeat: string) {
        await this.page.getByPlaceholder(PASSWORD_REPEAT_PLACEHOLDER).fill(passwordRepeat);
    }

    async submit(): Promise<AuthorizedPage | null> {
        await this.page.getByRole('button', {
            name: SUBMIT_BUTTON_TEXT,
        }).click();
        try {
            await this.logInButton.waitFor({
                state: 'hidden',
                timeout: 5000,
            });
            return new SynchronizingPage(this.page);
        } catch (error) {
            return null;
        }
    }
}
