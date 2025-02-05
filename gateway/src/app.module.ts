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

const DB_ENTITIES = [User, Video, Flow, UploadSession];

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DB_CONNECTION_STRING ?? 'postgresql://postgres:postgres@localhost:5432/retube',
            synchronize: true, // TODO: add env checking
            entities: DB_ENTITIES,
        }),
        TypeOrmModule.forFeature(DB_ENTITIES),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AmqpConfig, RedisConfig, AuthConfig],
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('auth.jwtSecret'),
            })
        }),
    ],
    controllers: [AuthController],
    providers: [AppService, AuthService, ChunkExchangeService],
})
export class AppModule {}
