import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // retire les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where:   { parentId: null },          // racines uniquement
      include: {
        children: {
          include: { children: true },      // 2 niveaux de profondeur
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where:   { id },
      include: {
        parent:   { select: { id: true, name: true, slug: true } },
        children: {
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Catégorie introuvable');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ?? toSlug(dto.name);

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Le slug "${slug}" est déjà utilisé`);

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Catégorie parente introuvable');
    }

    return this.prisma.category.create({ data: { name: dto.name, slug, parentId: dto.parentId } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Le slug "${dto.slug}" est déjà utilisé`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) throw new BadRequestException('Une catégorie ne peut pas être sa propre parente');
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Catégorie parente introuvable');
    }

    const data: any = { ...dto };
    if (dto.name && !dto.slug) data.slug = toSlug(dto.name);

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer : ${productCount} produit(s) utilisent cette catégorie`,
      );
    }

    const childCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer : ${childCount} sous-catégorie(s) dépendent de cette catégorie`,
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
