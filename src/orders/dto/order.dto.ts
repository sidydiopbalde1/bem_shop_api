import { IsEnum, IsString, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType, OrderStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderAdminFilterDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Recherche par email utilisateur' })
  @IsString() @IsOptional() search?: string;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsEnum(OrderStatus) @IsOptional() status?: OrderStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber() @IsOptional() @Type(() => Number) page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsNumber() @IsOptional() @Type(() => Number) limit?: number = 20;
}

export class OrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID() productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    example: [
      { productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 },
      { productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', quantity: 1 },
    ],
  })
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: DeliveryType, example: DeliveryType.CAMPUS, description: 'CAMPUS = retrait sur le campus, HOME = livraison à domicile' })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiPropertyOptional({ example: 'Cité universitaire Fann, Bâtiment B, Chambre 12', description: 'Obligatoire si deliveryType = HOME' })
  @IsString() @IsOptional()
  address?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
