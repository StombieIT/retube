import { Controller, Post, Body, Param, Delete, HttpException, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';
import { FFlow } from '@stombie/retube-core';
import { AppService } from './services/app.service';
import { FlowNotFoundError } from './errors/flow-not-found.error';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
    private readonly globalPrefix: string;
    private readonly host: string;

    constructor(private readonly app: AppService,
                configService: ConfigService) {
        this.globalPrefix = configService.get<string>('app.globalPrefix', '');
        this.host = configService.get<string>('app.host', 'localhost');
    }

    /**
     * Создание нового потока ffmpeg
     */
    @Post(':uploadSessionId')
    async createFlow(
        @Req() request: Request,
        @Param('uploadSessionId') uploadSessionId: string,
    ): Promise<FFlow.Response.Create> {
        console.log('createFlow', uploadSessionId);
        try {
            // Создание потока
            await this.app.createFlow(uploadSessionId);

            const protocol = request.protocol;
            // Возвращаем ссылку на flowUrl
            const flowUrl = `${protocol}://${this.host}${this.globalPrefix}/${uploadSessionId}`;
            return {
                status: 'success',
                message: `Flow created for session ${uploadSessionId}`,
                flowUrl,
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: `Failed to create flow: ${error.message}`,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Удаление существующего потока ffmpeg
     */
    @Delete(':uploadSessionId')
    async deleteFlow(@Param('uploadSessionId') uploadSessionId: string): Promise<FFlow.Response.Delete> {
        try {
            await this.app.deleteFlow(uploadSessionId);
            return {
                status: 'success',
                message: `Flow for session ${uploadSessionId} deleted successfully`,
            };
        } catch (error) {
            if (error instanceof FlowNotFoundError) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: error.message,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            throw new HttpException(
                {
                    status: 'error',
                    message: `Failed to delete flow: ${error.message}`,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Отправка данных в поток ffmpeg
     */
    @Post(':uploadSessionId/push')
    async pushToFlow(
        @Param('uploadSessionId') uploadSessionId: string,
        @Body() buffer: Buffer,
    ): Promise<FFlow.Response.Push> {
        console.log('pushToFlow', uploadSessionId, buffer);
        try {
            this.app.pushToFlow(uploadSessionId, buffer);
            return {
                status: 'success',
                message: `Data pushed to flow for session ${uploadSessionId}`,
            };
        } catch (error) {
            console.error('pushToFlow', error);
            if (error instanceof FlowNotFoundError) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: error.message,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            throw new HttpException(
                {
                    status: 'error',
                    message: `Failed to push data to flow: ${error.message}`,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Завершение потока (flow) для указанной сессии
     */
    @Post(':uploadSessionId/finish')
    async finishFlow(
        @Param('uploadSessionId') uploadSessionId: string,
    ): Promise<FFlow.Response.Finish> {
        console.log('finishFlow', uploadSessionId);
        try {
            // Вызов метода для завершения потока
            await this.app.finishFlow(uploadSessionId);

            return {
                status: 'success',
                message: `Flow finished for session ${uploadSessionId}`,
            };
        } catch (error) {
            // Обработка ошибки, если поток не найден
            if (error instanceof FlowNotFoundError) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: error.message,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            // Обработка других ошибок
            throw new HttpException(
                {
                    status: 'error',
                    message: `Failed to finish flow: ${error.message}`,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
