import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { PathService } from './services/path.service';
import { FFlowService } from './services/fflow.service';
import { AppService } from './services/app.service';
import { ApiConfig } from './config/api.config';
import { FFmpegConfig } from './config/ffmpeg.config';
import { FtpConfig } from './config/ftp.config';
import { FtpClientService } from './services/ftp-client.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AppConfig, FFmpegConfig, ApiConfig, FtpConfig]
        }),
    ],
    controllers: [AppController],
    providers: [FFlowService, PathService, FtpClientService, AppService],
})
export class AppModule {}
