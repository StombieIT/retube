import { NestFactory } from '@nestjs/core';
import { UploaderModule } from './uploader.module';
import { DistributionModule } from './distribution.module';

async function bootstrap() {
    const uploader = await NestFactory.create(UploaderModule);
    const distribution = await NestFactory.create(DistributionModule);

    await Promise.all([
        uploader.listen(process.env.UPLOADER_PORT ?? 4050),
        distribution.listen(process.env.DISTRIBUTION_PORT ?? 4051)
    ]);
}

bootstrap();
