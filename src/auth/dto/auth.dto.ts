import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT  = 'PARENT',
  ALUMNI  = 'ALUMNI',
  GUEST   = 'GUEST',
  ADMIN   = 'ADMIN',
}

export class RegisterDto {
  @ApiProperty({ example: 'fatou.diallo@ucad.sn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Fatou' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Diallo' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'fatou.diallo@ucad.sn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  @IsString()
  password: string;
}

export class TokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', description: 'JWT access token — expire après 15 min' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiaWF0IjoxNjE2MjM5MDIyfQ.drt_po6bHhDOAjxFgEDBBJFoKSCaLi5AaHcbienfylo', description: 'JWT refresh token — expire après 7 jours' })
  refreshToken: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-xxxx-xxxx' })
  id: string;

  @ApiProperty({ example: 'fatou.diallo@ucad.sn' })
  email: string;

  @ApiProperty({ example: 'Fatou' })
  firstName: string;

  @ApiProperty({ example: 'Diallo' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  role: UserRole;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class AuthResponseDto extends TokensDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
