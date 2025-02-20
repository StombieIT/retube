import { Injectable } from '@nestjs/common';
import { Gateway, User } from '@stombie/retube-core';

@Injectable()
export class UserConverterService {
    toSmallUser(user: User): Gateway.SmallUser {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
}