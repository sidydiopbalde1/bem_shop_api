import {
  Injectable, ConflictException,
  UnauthorizedException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserRole, UpdateProfileDto } from './dto/auth.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { GoogleUser } from './strategies/google.strategy';
import { FacebookUser } from './strategies/facebook.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? UserRole.GUEST,
      },
    });

    return this.issueAndPersistTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Identifiants invalides');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.issueAndPersistTokens(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Le mot de passe actuel est requis pour en définir un nouveau.');
      }
      if (!user.passwordHash) {
        throw new BadRequestException('Compte OAuth — impossible de définir un mot de passe.');
      }
      const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!valid) throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    const data: Record<string, unknown> = {};
    if (dto.firstName) data.firstName = dto.firstName;
    if (dto.lastName)  data.lastName  = dto.lastName;
    if (dto.newPassword) data.passwordHash = await argon2.hash(dto.newPassword);

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
  }

  async refreshTokens(userId: string, rawRefreshToken: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.hashedRefreshToken) throw new ForbiddenException('Accès refusé');

    const valid = await argon2.verify(user.hashedRefreshToken, rawRefreshToken);
    if (!valid) throw new ForbiddenException('Refresh token invalide');

    return this.issueAndPersistTokens(user);
  }

  async handleOAuthLogin(oauthUser: GoogleUser | FacebookUser): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({ where: { email: oauthUser.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          role: UserRole.GUEST,
        },
      });
    }

    return this.issueAndPersistTokens(user);
  }

  private async issueAndPersistTokens(user: {
    id: string; email: string; role: string;
    firstName: string; lastName: string;
    createdAt: Date; updatedAt: Date;
  }): Promise<AuthResponseDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: await argon2.hash(refreshToken) },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
