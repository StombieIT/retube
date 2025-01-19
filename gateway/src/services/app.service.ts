import { User, Video } from '@stombie/retube-core';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockChunkPusherService } from './mock-chunk-pusher.service';

@Injectable()
export class AppService implements OnModuleInit {
    constructor(private readonly mockChunkPusher: MockChunkPusherService,
                @InjectRepository(User) private readonly usersRepository: Repository<User>,
                /* @InjectRepository(Video) private readonly videosRepository: Repository<Video> */) {
    }

    async onModuleInit() {
        const user = this.usersRepository.create({
            email: 'stombie@yandex.ru',
            passwordHash: 'wad'
        });
        await this.usersRepository.save(user);
    }    
}
