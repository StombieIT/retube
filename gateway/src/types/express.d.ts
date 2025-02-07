import { User } from '@stombie/retube-core';

declare module 'express' {
    interface Request {
        user?: User;
    }
}
