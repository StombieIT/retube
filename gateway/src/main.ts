import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

config();

const {
    APP_PORT = 4080,
    SYNC_EDITOR_ORIGIN = 'http://localhost:5445',
    PLAYER_ORIGIN = 'http://localhost:3000',
} = process.env;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [
            SYNC_EDITOR_ORIGIN,
            PLAYER_ORIGIN,
        ],
        methods: [
            'GET',
            'POST',
            'PUT',
        ],
    });
    app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '10mb' }));

    await app.listen(APP_PORT);
}

bootstrap();
