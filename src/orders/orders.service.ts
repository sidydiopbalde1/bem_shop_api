import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersGateway } from './orders.gateway';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: OrdersGateway,
    private readonly loyalty: LoyaltyService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isApproved: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont invalides');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;

    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stock insuffisant pour ${product.name}`);
      }
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice };
    });

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          totalAmount,
          deliveryType: dto.deliveryType,
          address: dto.address,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } }, payment: true },
      });
    });

    // Créditer les points fidélité (1 point par 100 FCFA)
    await this.loyalty.credit(userId, Math.floor(totalAmount / 100), `ORDER:${order.id}`);

    return order;
  }

  findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, payment: true },
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (userId && order.userId !== userId) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
    this.gateway.emitStatusUpdate(order.id, dto.status);
    return updated;
  }
}
