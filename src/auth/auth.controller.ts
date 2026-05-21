import {
  Controller, Post, Get, Patch, Res,
  Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiBody, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, UpdateProfileDto } from './dto/auth.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard, GoogleAuthGuard } from './guards';
import type { GoogleUser } from './strategies/google.strategy';
import type { FacebookUser } from './strategies/facebook.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Créer un compte', description: 'Inscription avec email et mot de passe. Retourne les tokens JWT et les infos utilisateur.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter', description: 'Connexion par email/mot de passe. Retourne les tokens JWT et les infos utilisateur.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Se déconnecter', description: 'Invalide le refresh token stocké.' })
  @ApiResponse({ status: 204, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  logout(@GetUser('sub') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Rafraîchir les tokens', description: 'Utilise le refresh token (Bearer) pour obtenir une nouvelle paire de tokens.' })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens générés', type: AuthResponseDto })
  @ApiResponse({ status: 403, description: 'Refresh token invalide ou expiré' })
  refresh(
    @GetUser('sub') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'OAuth Google — redirection', description: 'Redirige vers la page de consentement Google.' })
  @ApiResponse({ status: 302, description: 'Redirection vers Google' })
  googleLogin(): void {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiExcludeEndpoint()
  async googleCallback(@GetUser() user: GoogleUser, @Res() res: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.handleOAuthLogin(user);
    const frontend = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');
    res.redirect(
      `${frontend}/auth/callback?access=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`,
    );
  }

  // @Public()
  // @UseGuards(FacebookAuthGuard)
  // @Get('facebook')
  // @ApiOperation({ summary: 'OAuth Facebook — redirection', description: 'Redirige vers la page de consentement Facebook.' })
  // @ApiResponse({ status: 302, description: 'Redirection vers Facebook' })
  // facebookLogin(): void {}

  // @Public()
  // @UseGuards(FacebookAuthGuard)
  // @Get('facebook/callback')
  // @ApiExcludeEndpoint()
  // facebookCallback(@GetUser() user: FacebookUser): Promise<AuthResponseDto> {
  //   return this.authService.handleOAuthLogin(user);
  // }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil courant', description: 'Retourne les informations de l\'utilisateur authentifié.' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur', schema: { example: { sub: 'uuid', email: 'fatou@ucad.sn', role: 'STUDENT' } } })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  me(@GetUser() user: Express.User) { return user; }

  @Patch('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour son profil', description: 'Modifie le prénom, nom et/ou le mot de passe de l\'utilisateur connecté.' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  @ApiResponse({ status: 400, description: 'Données invalides ou mot de passe actuel incorrect' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  updateProfile(@GetUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, dto);
  }
}
