
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FFlow, Holder, UploadSessionId } from '@stombie/retube-core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiService {
    private readonly holderUploadUrl: string;

    constructor(configService: ConfigService, private readonly httpService: HttpService) {
        // Базовый URL другого микросервиса
        this.holderUploadUrl = configService.get<string>('api.holderUploadUrl', 'http://localhost:4050');
    }

    /**
     * Регистрирует папки для загрузки
     */
    async registerUpload(uploadSessionId: UploadSessionId, formats: FFlow.FFmpegFormat[]): Promise<void> {
        if (!uploadSessionId || formats.length === 0) {
            throw new HttpException('Invalid input: uploadSessionId and formats are required.', HttpStatus.BAD_REQUEST);
        }

        const url = `${this.holderUploadUrl}/register/${uploadSessionId}`;
        const body: Holder.Upload.Request.Register = { formats };

        try {
            const response = await firstValueFrom(this.httpService.post(url, body));
            console.log(`Folders registered: ${response.data.message}`);
        } catch (error) {
            console.error(`Error registering folders: ${error.message}`);
            throw new HttpException(
                `Failed to register folders: ${error.message}`,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Удаляет папки загрузки
     */
    async unregisterUpload(uploadSessionId: UploadSessionId): Promise<void> {
        if (!uploadSessionId) {
            throw new HttpException('Invalid input: uploadSessionId is required.', HttpStatus.BAD_REQUEST);
        }

        const url = `${this.holderUploadUrl}/unregister/${uploadSessionId}`;

        try {
            const response = await firstValueFrom(this.httpService.delete(url));
            console.log(`Folders unregistered: ${response.data.message}`);
        } catch (error) {
            console.error(`Error unregistering folders: ${error.message}`);
            throw new HttpException(
                `Failed to unregister folders: ${error.message}`,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
