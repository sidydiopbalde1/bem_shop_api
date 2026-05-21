import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Maison' })
  @IsString() label: string;

  @ApiProperty({ example: 'Rue 10, Liberté 6' })
  @IsString() street: string;

  @ApiProperty({ example: 'Dakar' })
  @IsString() city: string;

  @ApiPropertyOptional({ example: 'Plateau' })
  @IsString() @IsOptional() district?: string;

  @ApiPropertyOptional({ example: '+221 77 000 00 00' })
  @IsString() @IsOptional() phone?: string;

  @ApiPropertyOptional({ example: true, description: 'Définir comme adresse par défaut' })
  @IsBoolean() @IsOptional() isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Bureau' })
  @IsString() @IsOptional() label?: string;

  @ApiPropertyOptional({ example: 'Avenue Cheikh Anta Diop' })
  @IsString() @IsOptional() street?: string;

  @ApiPropertyOptional({ example: 'Dakar' })
  @IsString() @IsOptional() city?: string;

  @ApiPropertyOptional({ example: 'Fann' })
  @IsString() @IsOptional() district?: string;

  @ApiPropertyOptional({ example: '+221 70 000 00 00' })
  @IsString() @IsOptional() phone?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean() @IsOptional() isDefault?: boolean;
}
