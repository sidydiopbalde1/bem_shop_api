import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Mamadou Diallo' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'mamadou@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Commande & livraison' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  subject: string;

  @ApiProperty({ example: 'Bonjour, je voudrais savoir où en est ma commande...' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}
