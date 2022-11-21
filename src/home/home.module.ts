/* eslint-disable prettier/prettier */
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
    imports: [PrismaModule],
    controllers: [HomeController],
    providers: [HomeService, {
        provide: APP_INTERCEPTOR,
        useClass: ClassSerializerInterceptor
    }, {
            provide: APP_GUARD,
            useClass: AuthGuard
        }],
})
export class HomeModule { }
