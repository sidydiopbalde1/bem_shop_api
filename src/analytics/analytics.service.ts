import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesSummary() {
    const [totalOrders, totalRevenue, totalUsers, pendingProducts] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isApproved: false } }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      totalUsers,
      pendingProducts,
    };
  }

  getSalesByDay(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    return this.prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: from } },
      _count: { id: true },
      _sum: { totalAmount: true },
    });
  }

  getTopProducts(limit = 10) {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
  }

  async exportOrdersCsv(): Promise<string> {
    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        payment: { select: { provider: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'id,email,status,amount,provider,payment_status,created_at';
    const rows = orders.map((o) =>
      [
        o.id, o.user.email, o.status,
        o.totalAmount, o.payment?.provider ?? '',
        o.payment?.status ?? '', o.createdAt.toISOString(),
      ].join(',')
    );

    return [header, ...rows].join('\n');
  }
}
