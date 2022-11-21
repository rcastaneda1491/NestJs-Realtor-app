/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/user/interceptors/user.interceptor';
import { HomeResponseDTO } from './dtos/home.dto';

interface GetHomesParam {
    city?: string
    price?: {
        gte?: number,
        lte?: number
    },
    propertyType?: PropertyType
}

interface CreateHomeParams {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: { url: string }[];
}

interface UpdateHomeParams {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

export const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    propertyType: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
};

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getHomes(filters: GetHomesParam): Promise<HomeResponseDTO[]> {
        const homes = await this.prismaService.home.findMany({
            include: {
                images: {
                    select: { url: true },
                    take: 1
                }
            },
            where: filters
        });

        if (!homes.length)
            throw new NotFoundException();

        return homes.map(home => {
            const newHome = { ...home, image: home.images[0].url }
            delete newHome.images
            return new HomeResponseDTO(newHome);
        })
    }

    async getHome(id: number): Promise<HomeResponseDTO> {
        const home = await this.prismaService.home.findUnique({
            where: {
                id,
            },
            include: {
                images: {
                    select: {
                        url: true,
                    },
                    take: 1
                },
                realtor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!home) {
            throw new NotFoundException();
        }

        return new HomeResponseDTO(home);
    }

    async createHome({
        address,
        numberOfBathrooms,
        numberOfBedrooms,
        city,
        landSize,
        propertyType,
        price,
        images
    }: CreateHomeParams,
        userId: number
    ) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                land_size: landSize,
                propertyType,
                price,
                realtor_id: userId,
            },
        });

        const homeImages = images.map((image) => {
            return { ...image, home_id: home.id }
        })

        await this.prismaService.image.createMany({
            data: homeImages
        })

        return new HomeResponseDTO(home)
    }

    async updateHome(id: number, data: UpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({ where: { id } });
        if (!home)
            throw new NotFoundException();

        const updatedHome = await this.prismaService.home.update({ where: { id }, data });

        return new HomeResponseDTO(updatedHome);
    }

    async deleteHome(id: number) {
        await this.prismaService.image.deleteMany({ where: { home_id: id } });

        await this.prismaService.home.delete({ where: { id } });

        return 'deleted'
    }

    async inquire(buyer: UserInfo, homeId: number, message: string) {
        const realtor = await this.getRealtorByHomeId(homeId);
        return this.prismaService.message.create({
            data: {
                message,
                realtor_id: realtor.id,
                buyer_id: buyer.id,
                home_id: homeId
            }
        });
    }

    async getHomeMessages(realtor: UserInfo, homeId: number) {
        const homeRealtor = await this.getRealtorByHomeId(homeId);

        if (homeRealtor.id !== realtor.id)

            throw new UnauthorizedException();

        return this.prismaService.message.findMany({
            where: { home_id: homeId }, select: {
                message: true,
                buyer: {
                    select: {
                        name: true,
                        phone: true,
                        email: true
                    }
                }
            }
        });
    }

    async getRealtorByHomeId(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: { id },
            select: {
                realtor: {
                    select: {
                        name: true,
                        id: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!home) {
            throw new NotFoundException();
        }

        return home.realtor;
    }
}
