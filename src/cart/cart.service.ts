import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, imageUrls: true, stock: true } } },
        },
      },
    });
  }

  async upsertItem(userId: string, dto: UpsertCartItemDto) {
    const cart = await this.getOrCreate(userId);

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Produit introuvable');

    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        customDesign: dto.customDesign as Prisma.InputJsonValue,
      },
      update: { quantity: dto.quantity, customDesign: dto.customDesign as Prisma.InputJsonValue },
      include: { product: true },
    });
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreate(userId);
    return this.prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
  }

  async clear(userId: string) {
    const cart = await this.getOrCreate(userId);
    return this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
