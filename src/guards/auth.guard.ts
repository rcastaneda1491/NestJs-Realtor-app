/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from 'src/prisma/prisma.service';

interface JWTPayload {
    name: string,
    id: number,
    iat: number,
    exp: number
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly prismaService: PrismaService) { }

    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass()
        ])

        const request = context.switchToHttp().getRequest();
        const token = request?.headers?.authorization?.split('Bearer ')[1];

        if (roles?.length) {
            try {
                const payload = await jwt.verify(token, process.env.JSON_TOKEN_KEY) as JWTPayload;
                const user = await this.prismaService.user.findUnique({ where: { id: payload.id } });

                if (!user) return false

                if (roles.includes(user.user_type)) return true

                return false;

            } catch (error) {
                return false;
            }
        }

        //if (!token) return false

        return true;
    }
}
