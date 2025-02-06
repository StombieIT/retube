import { NestFactory } from '@nestjs/core';
import { UploaderModule } from './uploader.module';
import { DistributionModule } from './distribution.module';

async function bootstrap() {
    const [distribution] = await Promise.all([
        NestFactory.create(DistributionModule),
        NestFactory.createApplicationContext(UploaderModule),
    ]);

    await distribution.listen(process.env.DISTRIBUTION_PORT ?? 4050);
}

bootstrap();
