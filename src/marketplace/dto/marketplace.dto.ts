import { IsString, IsNumber, IsOptional, IsUUID, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitProductDto {
  @ApiProperty({ example: 'Carnet BEM personnalisé' })
  @IsString() name: string;

  @ApiPropertyOptional({ example: 'Carnet A5 couverture rigide aux couleurs de BEM.' })
  @IsString() @IsOptional() description?: string;

  @ApiProperty({ example: 3500, description: 'Prix proposé en FCFA' })
  @IsNumber() @Min(0) price: number;

  @ApiProperty({ example: 100 })
  @IsNumber() @Min(0) stock: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID() categoryId: string;

  @ApiPropertyOptional({ example: ['https://cdn.bemshop.sn/carnet.jpg'] })
  @IsArray() @IsString({ each: true }) @IsOptional() imageUrls?: string[];
}
