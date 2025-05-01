import { Locator, Page } from '@playwright/test';
import { AuthModal } from './auth-modal';

const LOGOUT_BUTTON_TEXT = 'Выход';

export class AuthorizedPage {
    private readonly logOutButton: Locator;

    constructor(protected readonly page: Page) {
        this.logOutButton = page.getByRole('button', { name: 'Выход' });
    }

    async logOut(): Promise<AuthModal | null> {
        await this.logOutButton.click();
        try {
            await this.logOutButton.waitFor({
                state: 'hidden',
                timeout: 5000,
            });
            return new AuthModal(this.page);
        } catch (error) {
            return null;
        }
    }
}
