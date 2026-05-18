import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserFilterDto, UpdateUserRoleDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';

const SELECT_SAFE = {
  id: true, email: true, firstName: true,
  lastName: true, role: true, createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: UserFilterDto) {
    const { search, role, page = 1, limit = 20 } = filters;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, select: SELECT_SAFE,
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SELECT_SAFE });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: { role: dto.role }, select: SELECT_SAFE });
  }

  async suspend(id: string) {
    await this.findOne(id);
    // Invalide le refresh token → déconnexion forcée
    return this.prisma.user.update({
      where: { id },
      data: { hashedRefreshToken: null },
      select: SELECT_SAFE,
    });
  }
}
