/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Param, ParseEnumPipe, UnauthorizedException, Get } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { signupDTO, signinDTO, GenerateProductKeyDTO } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from "bcryptjs"
import { User } from '../decorators/user.decorator';
import { UserInfo } from '../interceptors/user.interceptor';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/signup/:userType')
    async signUp(@Body() body: signupDTO, @Param('userType', new ParseEnumPipe(UserType)) userType: UserType) {
        if (userType != UserType.BUYER) {
            if (!body.productKey)
                throw new UnauthorizedException();
            const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
            const isValidProductKey = await bcrypt.compare(validProductKey, body.productKey);

            if (!isValidProductKey)
                throw new UnauthorizedException();
        }
        return this.authService.signup(body, userType);
    }

    @Post('/signin')
    signin(@Body() body: signinDTO) {
        return this.authService.signin(body);
    }

    @Post('/key')
    generateProductKey(@Body() { email, userType }: GenerateProductKeyDTO) {
        return this.authService.generateProductKey(email, userType)
    }

    @Get('/me')
    me(@User() user: UserInfo) {
        return user
    }
}
