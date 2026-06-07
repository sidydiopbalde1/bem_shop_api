import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderAdminFilterDto } from './dto/order.dto';
import { Prisma } from '@prisma/client';
import { OrdersGateway } from './orders.gateway';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService, OrderMailData } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: OrdersGateway,
    private readonly loyalty: LoyaltyService,
    private readonly mail: MailService,
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

    // Notifications email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const mailData: OrderMailData = {
        orderId: order.id,
        clientFirstName: user.firstName,
        clientLastName: user.lastName,
        clientEmail: user.email,
        items: order.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          imageUrl: i.product.imageUrls?.[0] ?? undefined,
        })),
        totalAmount: Number(order.totalAmount),
        deliveryType: order.deliveryType,
        address: order.address ?? undefined,
        createdAt: order.createdAt,
      };
      await Promise.all([
        this.mail.sendOrderConfirmationToClient(mailData),
        this.mail.sendOrderNotificationToAdmin(mailData),
      ]);
    }

    return order;
  }

  findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(filters: OrderAdminFilterDto) {
    const { search, status, page = 1, limit = 20 } = filters;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(search && {
        user: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          payment: true,
          items: { include: { product: { select: { id: true, name: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, payment: true, user: true },
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (userId && order.userId !== userId) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async findOneAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrls: true, price: true } } } },
        payment: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
    this.gateway.emitStatusUpdate(order.id, dto.status);

    // Notifications email
    const { user } = order;
    if (user) {
      await Promise.all([
        this.mail.sendOrderStatusUpdateToClient(user.email, user.firstName, order.id, dto.status),
        this.mail.sendOrderStatusUpdateToAdmin(order.id, user.firstName, user.lastName, user.email, dto.status),
      ]);
    }

    return updated;
  }
}
