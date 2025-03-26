import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { FtpConfig } from './config/ftp.config';
import { FtpService } from './services/ftp.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [FtpConfig, AppConfig]
        })
    ],
    providers: [FtpService],
})
export class UploadModule {}
