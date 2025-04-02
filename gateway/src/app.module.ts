import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Video, Flow, UploadSession } from '@stombie/retube-core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './services/app.service';
import { AmqpConfig } from './config/amqp.config';
import { ChunkExchangeService } from './services/chunk-exchange.service';
import { RedisConfig } from './config/redis.config';
import { AuthConfig } from './config/auth.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AppController } from './controllers/app.controller';
import { UploadSessionConverterService } from './services/converters/upload-session.converter';
import { FlowConverterService } from './services/converters/flow.converter';
import { VideoConverterService } from './services/converters/video.converter';
import { UserConverterService } from './services/converters/user.converter';
import { HolderConfig } from './config/holder.config';

const DB_ENTITIES = [User, Video, Flow, UploadSession];

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DB_CONNECTION_STRING ?? 'postgresql://postgres:postgres@localhost:5432/retube',
            synchronize: true,
            entities: DB_ENTITIES,
        }),
        TypeOrmModule.forFeature(DB_ENTITIES),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AmqpConfig, RedisConfig, AuthConfig, HolderConfig],
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('auth.jwtSecret'),
            }),
        }),
    ],
    controllers: [AuthController, AppController],
    providers: [
        AppService, AuthService, ChunkExchangeService,
        UploadSessionConverterService, FlowConverterService, VideoConverterService, UserConverterService,
    ],
})
export class AppModule {}
