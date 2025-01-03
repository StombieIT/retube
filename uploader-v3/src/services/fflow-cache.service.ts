import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { UploadSessionId } from '@stombie/retube-core';

@Injectable()
export class FFlowCacheService implements OnModuleInit, OnModuleDestroy {    
    private readonly connectionString: string;
    private readonly fflowCacheDB: number;
    private readonly redisDB: Redis;
    private redisDBConnectionPromise: Maybe<Promise<void>>;

    constructor(configService: ConfigService) {
        this.connectionString = configService.get<string>('redis.connectionString', 'redis://localhost');
        this.fflowCacheDB = configService.get<number>('redis.fflowCacheDB');
        this.redisDB = new Redis(this.connectionString);
    }

    async onModuleInit() {
        await this.connectToRedisDB();
        await this.redisDB.select(this.fflowCacheDB);
    }

    onModuleDestroy() {
        return this.redisDB.quit();
    }

    async isFlowExists(uploadSessionId: UploadSessionId): Promise<boolean> {
        try {
            const exists = await this.redisDB.exists(uploadSessionId);
            if (exists === 1) {
                return true;
            } else {
                console.info('isFlowExists', `Flow with uploadSessionId ${uploadSessionId} does not exist`);
                return false;
            }
        } catch (err) {
            console.error('isFlowExists', err);
            return false;
        }
    }

    async getFlowUrl(uploadSessionId: UploadSessionId): Promise<Maybe<string>> {
        try {
            const flowUrl = await this.redisDB.get(uploadSessionId);

            if (!flowUrl) {
                console.info('getFlowUrl', `Flow with uploadSessionId ${uploadSessionId} does not exist`);
                return;
            }
            return flowUrl;
        } catch (err) {
            console.error('getFlowUrl', err);
            return;
        }
    }

    /**
     * @description возвращает результат добавления flowUrl,
     * @returns {boolean} - если добавление успешно - true, неуспешно - false
     * @param uploadSessionId - сессия загрузки
     * @param flowUrl - урл линии загрузки
     */
    async addFlowUrl(uploadSessionId: UploadSessionId, flowUrl: string): Promise<boolean> {
        try {
            await this.redisDB.set(uploadSessionId, flowUrl);
            return true;
        } catch (err) {
            console.error('addFlowUrl', err);
            return false;
        }
    }

    /**
     * @description возвращает результат удаления flowUrl,
     * @returns {boolean} - если удаление успешно - true, неуспешно - false
     * @param uploadSessionId - сессия загрузки
     */
    async deleteFlowUrl(uploadSessionId: UploadSessionId): Promise<boolean> {
        try {
            await this.redisDB.del(uploadSessionId);
            return true;
        } catch (err) {
            console.error('deleteFlowUrl', err);
            return false;
        }
    }

    private connectToRedisDB(): Promise<void> {
        if (!this.redisDBConnectionPromise) {
            this.redisDBConnectionPromise = new Promise<void>((resolve, reject) => {
                this.redisDB.on('connect', () => {
                    console.info(`Successfully connected to redis DB ${this.connectionString}`);
                    resolve();
                });
                
                this.redisDB.on('error', (err) => {
                    console.info(`Unable connect to redis DB ${this.connectionString}:`, err);
                    reject(err);
                });
            });
        }

        return this.redisDBConnectionPromise;
    }
}
