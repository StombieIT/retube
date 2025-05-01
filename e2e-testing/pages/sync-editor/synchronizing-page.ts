import { Page } from '@playwright/test';
import { AuthorizedPage } from './authorized-page';

export class SynchronizingPage extends AuthorizedPage {
    constructor(page: Page) {
        super(page);
    }
}
