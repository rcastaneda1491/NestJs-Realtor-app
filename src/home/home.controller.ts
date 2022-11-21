/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Param, Query, ParseIntPipe, Body, UnauthorizedException } from '@nestjs/common';
import { PropertyType, UserType } from '@prisma/client';
import { User } from 'src/user/decorators/user.decorator';
import { UserInfo } from 'src/user/interceptors/user.interceptor';
import { CreateHomeDTO, enquireDTO, HomeResponseDTO, UpdateHomeDTO } from './dtos/home.dto';
import { HomeService } from './home.service';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }

    @Get()
    getHomes(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: PropertyType
    ): Promise<HomeResponseDTO[]> {
        const price = minPrice || maxPrice ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
        } : undefined

        const filters = {
            ...(city && { city }),
            ...(price && { price }),
            ...(propertyType && { propertyType })
        };

        return this.homeService.getHomes(filters);
    }

    @Get(':id')
    getHome(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDTO> {
        return this.homeService.getHome(id);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Post()
    createHome(@Body() body: CreateHomeDTO, @User() user: UserInfo) {
        return this.homeService.createHome(body, user.id);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Put(':id')
    async updateHome(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHomeDTO,
        @User() user: UserInfo
    ) {
        const homeRealtor = await this.homeService.getRealtorByHomeId(id);

        if (homeRealtor.id !== user.id)
            throw new UnauthorizedException();

        return this.homeService.updateHome(id, body)
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Delete(':id')
    async deleteHome(
        @Param('id', ParseIntPipe) id: number,
        @User() user: UserInfo
    ) {
        const homeRealtor = await this.homeService.getRealtorByHomeId(id);

        if (homeRealtor.id !== user.id)
            throw new UnauthorizedException();

        return this.homeService.deleteHome(id);
    }

    @Roles(UserType.BUYER)
    @Post('/inquire/:id')
    inquire(
        @Param('id', ParseIntPipe) homeId: number,
        @User() user: UserInfo,
        @Body() { message }: enquireDTO,
    ) {

        return this.homeService.inquire(user, homeId, message);
    }

    @Roles(UserType.REALTOR)
    @Get('/:id/messages')
    getHomeMessages(
        @Param('id', ParseIntPipe) homeId: number,
        @User() user: UserInfo
    ) {
        return this.homeService.getHomeMessages(user, homeId);
    }
}
