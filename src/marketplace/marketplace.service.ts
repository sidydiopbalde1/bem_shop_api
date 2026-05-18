import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitProductDto } from './dto/marketplace.dto';

const COMMISSION_RATE = 0.10; // 10 %

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  submitProduct(vendorId: string, dto: SubmitProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        vendorId,
        isApproved: false,          // en attente de validation admin
        commission: dto.price * COMMISSION_RATE,
      },
    });
  }

  getMyProducts(vendorId: string) {
    return this.prisma.product.findMany({
      where: { vendorId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getPendingProducts() {
    return this.prisma.product.findMany({
      where: { isApproved: false, vendorId: { not: null } },
      include: { vendor: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (!product.vendorId) throw new ForbiddenException('Ce produit n\'est pas un produit vendeur');

    return this.prisma.product.update({
      where: { id: productId },
      data: { isApproved: true },
    });
  }

  async rejectProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');

    return this.prisma.product.delete({ where: { id: productId } });
  }
}
