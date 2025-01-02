import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FFlowService } from './fflow.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        })
    ],
    controllers: [AppController],
    providers: [FFlowService],
})
export class AppModule {}
