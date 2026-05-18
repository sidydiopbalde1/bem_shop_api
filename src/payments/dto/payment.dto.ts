import { IsEnum, IsUUID } from 'class-validator';
import { PaymentProvider } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InitPaymentDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID de la commande à payer' })
  @IsUUID() orderId: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.STRIPE, description: 'Prestataire de paiement' })
  @IsEnum(PaymentProvider) provider: PaymentProvider;
}
