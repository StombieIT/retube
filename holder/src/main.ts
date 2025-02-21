import { NestFactory } from '@nestjs/core';
import { UploaderModule } from './uploader.module';
import { DistributionModule } from './distribution.module';

const {
    PLAYER_ORIGIN = 'http://localhost:3000',
} = process.env;

async function bootstrap() {
    const [distribution] = await Promise.all([
        NestFactory.create(DistributionModule),
        NestFactory.createApplicationContext(UploaderModule),
    ]);

    distribution.enableCors({
        origin: [
            PLAYER_ORIGIN,
        ],
        methods: [
            'GET',
        ],
    });

    await distribution.listen(process.env.DISTRIBUTION_PORT ?? 4050);
}

bootstrap();
