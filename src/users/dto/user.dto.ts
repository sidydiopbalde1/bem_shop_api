import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../auth/dto/auth.dto';

export class UserFilterDto {
  @ApiPropertyOptional({ example: 'Fatou', description: 'Recherche par nom ou email' })
  @IsString() @IsOptional() search?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole) @IsOptional() role?: UserRole;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber() @IsOptional() @Type(() => Number) page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsNumber() @IsOptional() @Type(() => Number) limit?: number = 20;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole) role: UserRole;
}
