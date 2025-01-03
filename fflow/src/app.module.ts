import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FFlowService } from './fflow.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AppConfig]
        }),
    ],
    controllers: [AppController],
    providers: [FFlowService],
})
export class AppModule {}
