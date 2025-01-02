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
    async createFlow(uploadSessionId: string, args: string[]): Promise<AxiosResponse<FFlow.Response.Create>> {
        const url = `${this.fflowUrl}/${uploadSessionId}`;
        try {
            return firstValueFrom(
                this.httpService.post(url, { args }),
            );
        } catch (error) {
            throw new Error(`Error creating flow: ${error.message}`);
        }
    }

    /**
     * Удаление потока
     */
    async deleteFlow(uploadSessionId: string): Promise<AxiosResponse<FFlow.Response.Delete>> {
        const url = `${this.fflowUrl}/${uploadSessionId}`;
        try {
            return firstValueFrom(this.httpService.delete(url));
        } catch (error) {
            throw new Error(`Error deleting flow: ${error.message}`);
        }
    }

    /**
     * Отправка данных в поток
     */
    async pushToFlow(uploadSessionId: string, buffer: Buffer): Promise<AxiosResponse<FFlow.Response.Push>> {
        const url = `${this.fflowUrl}/${uploadSessionId}/push`;
        try {
            return firstValueFrom(
                this.httpService.post(url, buffer),
            );
        } catch (error) {
            throw new Error(`Error pushing data to flow: ${error.message}`);
        }
    }
}
