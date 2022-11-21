/* eslint-disable prettier/prettier */
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface UserInfo {
    name: string,
    id: number,
    iat: number,
    exp: number
}

export class UserInterceptor implements NestInterceptor {
    async intercept(
        context: ExecutionContext, handler: CallHandler
    ) {
        const request = context.switchToHttp().getRequest();
        const token = request?.headers?.authorization?.split('Bearer ')[1];
        const user = await jwt.decode(token);
        request.user = user;
        return handler.handle();;
    }
}
