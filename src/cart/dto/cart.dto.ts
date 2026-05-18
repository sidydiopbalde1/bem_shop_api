import { IsUUID, IsNumber, IsOptional, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertCartItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID du produit' })
  @IsUUID() productId: string;

  @ApiProperty({ example: 2, minimum: 1, description: 'Quantité souhaitée' })
  @IsNumber() @Min(1) quantity: number;

  @ApiPropertyOptional({
    example: { color: 'navy', size: 'L', text: 'BEM 2024' },
    description: 'Options de personnalisation (broderie, couleur, taille…)',
  })
  @IsObject() @IsOptional() customDesign?: Record<string, unknown>;
}

export class RemoveCartItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID() productId: string;
}
