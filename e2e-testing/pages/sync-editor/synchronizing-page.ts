import { Page } from '@playwright/test';

export class SynchronizingPage {
    constructor(private readonly page: Page) {
    }
}
