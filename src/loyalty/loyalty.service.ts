import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  credit(userId: string, points: number, source: string) {
    return this.prisma.loyaltyPoint.create({ data: { userId, points, source } });
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.prisma.loyaltyPoint.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    return result._sum.points ?? 0;
  }

  getHistory(userId: string) {
    return this.prisma.loyaltyPoint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeaderboard(limit = 10) {
    return this.prisma.loyaltyPoint.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });
  }

  getBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async checkAndUnlockBadges(userId: string, orderCount: number) {
    const milestones: Record<number, string> = {
      1:  'Premier achat',
      5:  'Acheteur régulier',
      10: 'Fidèle client',
      25: 'VIP',
    };

    const badgeName = milestones[orderCount];
    if (!badgeName) return;

    const badge = await this.prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) return;

    await this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      create: { userId, badgeId: badge.id },
      update: {},
    });
  }
}
