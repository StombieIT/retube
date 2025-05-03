import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const {
    BASE_URL = 'http://localhost:5445',
} = process.env;

export default defineConfig({
    use: {
        baseURL: BASE_URL,
        viewport: null,
        launchOptions: {
            args: ['--start-maximized'], // полноэкранный режим
        },
    },
});
