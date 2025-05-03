import { Locator, Page } from '@playwright/test';
import { AuthorizedPage } from './authorized-page';

const TITLE_PLACEHOLDER = 'Заголовок видео';
const DESCRIPTION_PLACEHOLDER = 'Описание видео';
const ADD_FLOW_BUTTON_LABEL = 'Добавить поток';
const UPLOAD_BUTTON_LABEL = 'Загрузить';
const DELETE_BUTTON_LABEL = 'Удалить';
const MOTIVATION_TEXT_TEST_ID = 'motivation-text';
const FLOW_CANDIDATE_TEST_ID = 'flow-candidate';
const FLOWS_GRID_TEST_ID = 'flows-grid';
const INPUT_FILE_SELECTOR = 'input[type="file"]';
const VIDEO_SELECTOR = 'video';

export class SynchronizingPage extends AuthorizedPage {
    private readonly titleField: Locator;    
    private readonly descriptionField: Locator;    
    private readonly uploadButton: Locator;
    private readonly flowCandidate: Locator;

    constructor(page: Page) {
        super(page);
        this.titleField = this.page.getByPlaceholder(TITLE_PLACEHOLDER);
        this.descriptionField = this.page.getByPlaceholder(DESCRIPTION_PLACEHOLDER);
        this.uploadButton = this.page.getByRole('button', { name: UPLOAD_BUTTON_LABEL });
        this.flowCandidate = this.page.getByTestId(FLOW_CANDIDATE_TEST_ID);
    }

    getMotivationText(): Locator {
        return this.page.getByTestId(MOTIVATION_TEXT_TEST_ID);
    }

    getFlowsGrid(): Locator {
        return this.page.getByTestId(FLOWS_GRID_TEST_ID);
    }

    getVideoLocator(): Locator {
        return this.page.locator(VIDEO_SELECTOR);
    }

    getUploadButton(): Locator {
        return this.uploadButton;
    }

    async fillTitle(title: string) {
        await this.titleField.fill(title);
    }

    async fillDescription(description: string) {
        await this.descriptionField.fill(description);
    }

    async addFlow() {
        const addFlowButton = this.page.getByRole('button', { name: ADD_FLOW_BUTTON_LABEL });
        await this.checkDisabled(addFlowButton);
        await addFlowButton.click();
    }

    async getFlowsCount() {
        return await this.flowCandidate.count();
    }

    async addVideoToFlow(flowIdx: number, video: Buffer) {
        await this.flowCandidate
            .nth(flowIdx)
            .locator(INPUT_FILE_SELECTOR)
            .setInputFiles({
                name: `flow-${flowIdx}.mp4`,
                mimeType: 'video/mp4',
                buffer: video,
            });
    }

    async deleteFlow(flowIdx: number) {
        await this.flowCandidate
            .nth(flowIdx)
            .getByRole('button', { name: DELETE_BUTTON_LABEL })
            .click();
    }

    async uploadFlow() {
        const uploadButton = this.getUploadButton();
        await this.checkDisabled(uploadButton);
        await uploadButton.click();
    }

    private async checkDisabled(locator: Locator) {
        const isDisabled = await locator.isDisabled();
        if (isDisabled) {
            throw new Error('Элемент не активен');
        }
    }
}
