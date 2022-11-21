/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcryptjs"
import { UserType } from '@prisma/client'
import * as jwt from 'jsonwebtoken'

interface SignupParams {
    email: string;
    password: string;
    name: string;
    phone: string;
}

interface SigninParams {
    email: string;
    password: string;
}

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) { }

    async signup({ email, password, name, phone }: SignupParams, userType: UserType) {
        const userExists = await this.prismaService.user.findUnique({ where: { email } });

        if (userExists)
            throw new BadRequestException('El correo ingresado ya existe');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await this.prismaService.user.create({ data: { email, name, phone, password: hashedPassword, user_type: userType } })

        return this.generateJWT(name, user.id);
    }

    async signin({ email, password }: SigninParams) {
        const userExists = await this.prismaService.user.findUnique({ where: { email } });

        if (!userExists)
            throw new BadRequestException('El correo ingresado no existe');

        const hashedPassword = userExists.password;
        const isValldPassword = await bcrypt.compare(password, hashedPassword);

        if (!isValldPassword)
            throw new BadRequestException('Contraseña incorrecta');

        return this.generateJWT(userExists.name, userExists.id);
    }

    generateJWT(name: string, id: number) {
        return jwt.sign({
            name: name,
            id: id
        }, process.env.JSON_TOKEN_KEY, {
            expiresIn: 3600000
        });
    }

    async generateProductKey(email: string, userType: UserType) {
        const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(string, salt)
    }
}
