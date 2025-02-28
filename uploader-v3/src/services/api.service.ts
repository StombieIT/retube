import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { FFlow } from '@stombie/retube-core';

@Injectable()
export class ApiService {
    private readonly fflowUrl: string;    

    constructor(private readonly httpService: HttpService,
                configService: ConfigService) {
        this.fflowUrl = configService.get<string>('api.fflowUrl');
    }

    /**
     * Создание нового потока
     */
    async createFlow(uploadSessionId: string): Promise<AxiosResponse<FFlow.Response.Create>> {
        const url = `${this.fflowUrl}/${uploadSessionId}`;
        try {
            return firstValueFrom(
                this.httpService.post(url),
            );
        } catch (error) {
            throw new Error(`Error creating flow: ${error.message}`);
        }
    }

    /**
     * Удаление потока
     */
    async deleteFlow(deleteUrl: string): Promise<AxiosResponse<FFlow.Response.Delete>> {
        try {
            return await firstValueFrom(this.httpService.delete(deleteUrl));
        } catch (error) {
            throw new Error(`Error deleting flow: ${error.message}`);
        }
    }

    /**
     * Успешное завершение потока
     */
    async finishFlow(finishUrl: string, params: FFlow.Request.Finish): Promise<AxiosResponse<FFlow.Response.Finish>> {
        try {
            return await firstValueFrom(
                this.httpService.post(finishUrl, params),
            );
        } catch (error) {
            throw new Error(`ApiService#finishFlow: Error finishing flow: ${error.message}`);
        }
    }

    /**
     * Отправка данных в поток
     */
    async pushToFlow(pushUrl: string, buffer: Buffer): Promise<FFlow.Response.Push> {
        try {
            const response = await fetch(pushUrl, {
                body: buffer,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
            });
            const result = await response.json();
            return result as FFlow.Response.Push;
        } catch (error) {
            throw new Error(`ApiService#pushToFlow: Error pushing data to flow: ${error.message}`);
        }
    }
}
