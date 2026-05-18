import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitPaymentDto } from './dto/payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(userId: string, dto: InitPaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
    });
    if (!order) throw new NotFoundException('Commande introuvable');

    const existing = await this.prisma.payment.findUnique({ where: { orderId: dto.orderId } });
    if (existing?.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Commande déjà payée');
    }

    return this.prisma.payment.upsert({
      where: { orderId: dto.orderId },
      create: {
        orderId: dto.orderId,
        provider: dto.provider,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
      },
      update: { provider: dto.provider, status: PaymentStatus.PENDING },
    });
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    // Stripe webhook signature verification
    // const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
    // À connecter avec la lib stripe selon votre setup
    return { received: true };
  }

  async confirm(paymentId: string, reference: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.SUCCESS, reference },
    });
  }

  async fail(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
