import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: process.env.ROOT_PATH || '/data',
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AppConfig]
        })
    ],
})
export class DistributionModule {}
