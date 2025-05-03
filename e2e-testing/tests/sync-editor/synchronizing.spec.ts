import { expect, test } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AuthModal } from '../../pages/sync-editor/auth-modal';
import { SynchronizingPage } from '../../pages/sync-editor/synchronizing-page';

const {
    USER_EMAIL,
    USER_PASSWORD,
} = process.env;

const MAX_FLOWS_COUNT = 4;
const UPLOADING_MAX_FLOWS_COUNT = 2;
const VIDEO_TITLE = 'video';
const VIDEO_DESCRIPTION = 'description';

test.describe('Страница синхронизации', () => {
    let videoBuffer: Buffer;

    test.beforeAll(async () => {
        videoBuffer = await fs.readFile(
            path.resolve(__dirname, 'data', 'test-video.mp4')
        );
    });

    test.beforeEach(async ({ page }) => {
        const authModal = new AuthModal(page);

        await authModal.open();
        await authModal.switchToLogIn();
        await authModal.fillEmail(USER_EMAIL!);
        await authModal.fillPassword(USER_PASSWORD!);
        await authModal.submit();
    });    

    test('ui сетки потоков', async ({ page }) => {
        const synchronizing = new SynchronizingPage(page);

        for (let i = 0; i < MAX_FLOWS_COUNT; i++) {
            await synchronizing.addFlow();
            const flowGrid = synchronizing.getFlowsGrid();
            await expect(flowGrid).toHaveScreenshot(`flow_grid_${i + 1}.png`);
        }
    });

    test('ограничение на количество потоков', async ({ page }) => {
        const synchronizing = new SynchronizingPage(page);     

        for (let i = 0; i < MAX_FLOWS_COUNT; i++) {
            await synchronizing.addFlow();
        }

        await expect(synchronizing.addFlow).rejects.toThrow();
    });

    test('добавление и удаление потоков', async ({ page }) => {
        const synchronizing = new SynchronizingPage(page);

        const flowsGrid = synchronizing.getFlowsGrid();

        const screenshotOptions = {
            mask: [
                synchronizing.getVideoLocator(),
            ]
        };

        for (let i = 0; i < MAX_FLOWS_COUNT; i++) {
            await synchronizing.addFlow();
            await expect(flowsGrid).toHaveScreenshot(`adding-${i + 1}.png`, screenshotOptions);
        }
        
        for (let i = MAX_FLOWS_COUNT - 1; i >= 1; i--) {
            await synchronizing.deleteFlow(0);
            await expect(flowsGrid).toHaveScreenshot(`deleting-${i}.png`, screenshotOptions);
        }
        
        await synchronizing.deleteFlow(0);
        await expect(flowsGrid).toBeHidden();
    });

    test('загрузка видео в потоки', async ({ page }) => {
        const synchronizing = new SynchronizingPage(page);

        for (let i = 0; i < UPLOADING_MAX_FLOWS_COUNT; i++) {
            await synchronizing.addFlow();
        }

        const flowsGrid = synchronizing.getFlowsGrid();

        await expect(flowsGrid).toHaveScreenshot('uploading_grid_init.png');

        for (let i = 0; i < UPLOADING_MAX_FLOWS_COUNT; i++) {

            await synchronizing.addVideoToFlow(i, videoBuffer);
            
            await expect(flowsGrid).toHaveScreenshot(`uploading_grid_${i + 1}.png`, {
                mask: [
                    synchronizing.getVideoLocator(),
                ]
            });
        }
    });

    test('валидация перед загрузкой', async ({ page }) => {
        const synchronizing = new SynchronizingPage(page);

        const uploadButton = synchronizing.getUploadButton();
        await expect(uploadButton).toBeHidden();

        await synchronizing.addFlow();
        await expect(synchronizing.uploadFlow).rejects.toThrow();
        await synchronizing.fillTitle(VIDEO_TITLE);
        await expect(synchronizing.uploadFlow).rejects.toThrow();
        await synchronizing.fillDescription(VIDEO_DESCRIPTION);
        await expect(synchronizing.uploadFlow).rejects.toThrow();
        await synchronizing.addFlow();
        
        await synchronizing.addVideoToFlow(0, videoBuffer);
        await expect(synchronizing.uploadFlow).rejects.toThrow();
        await synchronizing.addVideoToFlow(1, videoBuffer);
        await synchronizing.uploadFlow();

        await expect(synchronizing.uploadFlow).rejects.toThrow();
    });
});
