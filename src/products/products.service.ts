import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto, SetThresholdDto } from './dto/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProductFilterDto) {
    const { search, categoryId, categorySlug, minPrice, maxPrice, page = 1, limit = 20, isApproved } = filters;

    // Résoudre le slug en categoryId si fourni
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && categorySlug) {
      const cat = await this.prisma.category.findUnique({ where: { slug: categorySlug } });
      resolvedCategoryId = cat?.id;
    }

    // isApproved: si explicitement fourni en query param, on l'utilise ; sinon défaut à true (catalogue public)
    const approvedFilter: boolean | undefined =
      isApproved === 'true' ? true :
      isApproved === 'false' ? false :
      true;

    const where: Prisma.ProductWhereInput = {
      isApproved: approvedFilter,
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
      ...(minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, vendor: { select: { id: true, firstName: true, lastName: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: { select: { id: true, firstName: true, lastName: true } },
        reviews: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, isApproved: true, stockThreshold: dto.stockThreshold ?? 20 },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  /** Définir ou supprimer le seuil d'alerte d'un produit */
  async setThreshold(id: string, threshold: number | null) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { stockThreshold: threshold },
      select: { id: true, name: true, stock: true, stockThreshold: true },
    });
  }

  /**
   * Retourne tous les produits dont le stock est ≤ au seuil configuré.
   * Seuls les produits avec un seuil défini sont inclus.
   */
  async findBelowThreshold() {
    const products = await this.prisma.product.findMany({
      where: {
        stockThreshold: { not: null },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        stockThreshold: true,
      },
    });

    return products
      .filter((p) => p.stock <= (p.stockThreshold as number))
      .map((p) => ({
        id: p.id,
        productName: p.name,
        stock: p.stock,
        threshold: p.stockThreshold as number,
      }));
  }
}
