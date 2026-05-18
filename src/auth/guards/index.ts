import { AuthGuard } from '@nestjs/passport';
import {
  Injectable, ExecutionContext,
  ForbiddenException, UnauthorizedException, CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../dto/auth.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super(); }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }

  handleRequest<T>(err: Error, user: T): T {
    if (err || !user) throw err ?? new UnauthorizedException('Token manquant ou invalide');
    return user;
  }
}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest<T>(err: Error, user: T): T {
    if (err || !user) throw err ?? new ForbiddenException('Authentification Google échouée');
    return user;
  }
}

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  handleRequest<T>(err: Error, user: T): T {
    if (err || !user) throw err ?? new ForbiddenException('Authentification Facebook échouée');
    return user;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = ctx.switchToHttp().getRequest();
    if (!required.includes(user?.role)) {
      throw new ForbiddenException('Accès refusé : rôle insuffisant');
    }
    return true;
  }
}
