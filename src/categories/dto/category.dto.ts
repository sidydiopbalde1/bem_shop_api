import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Vêtements', description: 'Nom de la catégorie' })
  @IsString() @MinLength(2) name: string;

  @ApiPropertyOptional({
    example: 'vetements',
    description: 'Slug URL (généré automatiquement depuis le nom si non fourni)',
  })
  @IsString() @IsOptional() slug?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID de la catégorie parente (pour créer une sous-catégorie)',
  })
  @IsUUID() @IsOptional() parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Vêtements & Accessoires' })
  @IsString() @MinLength(2) @IsOptional() name?: string;

  @ApiPropertyOptional({ example: 'vetements-accessoires' })
  @IsString() @IsOptional() slug?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID() @IsOptional() parentId?: string;
}
