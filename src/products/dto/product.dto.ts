import {
  IsString, IsNumber, IsOptional, IsUUID,
  IsBoolean, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Hoodie BEM 2024' })
  @IsString() name: string;

  @ApiPropertyOptional({ example: 'Hoodie officiel de la promotion BEM 2024, coton premium.' })
  @IsString() @IsOptional() description?: string;

  @ApiProperty({ example: 15000, description: 'Prix en FCFA' })
  @Type(() => Number) @IsNumber() price: number;

  @ApiProperty({ example: 50, description: 'Quantité en stock' })
  @Type(() => Number) @IsNumber() @Min(0) stock: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID de la catégorie' })
  @IsUUID() categoryId: string;

  // Injecté par le controller après upload Cloudinary — non exposé dans le form
  imageUrls?: string[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Hoodie BEM 2024 — Édition limitée' })
  @IsString() @IsOptional() name?: string;

  @ApiPropertyOptional({ example: 'Description mise à jour.' })
  @IsString() @IsOptional() description?: string;

  @ApiPropertyOptional({ example: 18000 })
  @Type(() => Number) @IsNumber() @IsOptional() price?: number;

  @ApiPropertyOptional({ example: 30 })
  @Type(() => Number) @IsNumber() @IsOptional() stock?: number;

  @ApiPropertyOptional({ example: true, description: 'Approuver ou désapprouver le produit' })
  @IsBoolean() @IsOptional() isApproved?: boolean;

  // Injecté par le controller après upload Cloudinary — non exposé dans le form
  imageUrls?: string[];
}

export class ProductFilterDto {
  @ApiPropertyOptional({ example: 'hoodie', description: 'Recherche full-text sur nom et description' })
  @IsString() @IsOptional() search?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID() @IsOptional() categoryId?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Prix minimum en FCFA' })
  @IsNumber() @IsOptional() @Type(() => Number) minPrice?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Prix maximum en FCFA' })
  @IsNumber() @IsOptional() @Type(() => Number) maxPrice?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber() @IsOptional() @Type(() => Number) page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsNumber() @IsOptional() @Type(() => Number) limit?: number = 20;
}
