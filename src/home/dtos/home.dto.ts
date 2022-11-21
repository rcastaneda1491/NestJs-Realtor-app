/* eslint-disable prettier/prettier */
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator'
import { Exclude, Expose, Type } from 'class-transformer'
import { PropertyType } from '@prisma/client'

export class HomeResponseDTO {
    constructor(partial: Partial<HomeResponseDTO>) {
        Object.assign(this, partial)
    }

    id: number
    address: string

    image: string

    @Exclude()
    number_of_bedrooms: number

    @Expose({ name: 'numberOfBedrooms' })
    numberOfBedrooms() {
        return this.number_of_bedrooms
    }

    @Exclude()
    number_of_bathrooms: number

    @Expose({ name: 'numberOfBathrooms' })
    numberOfBathrooms() {
        return this.number_of_bathrooms
    }

    city: string

    @Exclude()
    listed_date: Date

    @Expose({ name: 'listedDate' })
    listedDate() {
        return this.listed_date
    }

    price: number

    @Exclude()
    land_size: number

    @Expose({ name: 'landSize' })
    landSize() {
        return this.land_size
    }

    propertyType: PropertyType

    @Exclude()
    created_at: Date

    @Exclude()
    updated_at: Date

    @Exclude()
    realtor_id: number
}

class Image {
    @IsString()
    @IsNotEmpty()
    url: string;
}

export class CreateHomeDTO {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNumber()
    @IsPositive()
    numberOfBedrooms: number;

    @IsNumber()
    @IsPositive()
    numberOfBathrooms: number;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    landSize: number;

    @IsEnum(PropertyType)
    propertyType: PropertyType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Image)
    images: Image[];
}

export class UpdateHomeDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    numberOfBedrooms?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    numberOfBathrooms?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    city?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    landSize?: number;

    @IsOptional()
    @IsEnum(PropertyType)
    propertyType?: PropertyType;
}

export class enquireDTO {
    @IsString()
    @IsNotEmpty()
    message: string
}