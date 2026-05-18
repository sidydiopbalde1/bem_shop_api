import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Loyalty')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Solde de points', description: 'Retourne le nombre total de points de fidélité accumulés.' })
  @ApiResponse({ status: 200, description: 'Solde actuel', schema: { example: { total: 250 } } })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getBalance(@GetUser('sub') userId: string) {
    return this.loyaltyService.getBalance(userId);
  }

  @Get('history')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Historique des points', description: 'Liste toutes les transactions de points (achat, bonus, etc.).' })
  @ApiResponse({ status: 200, description: 'Historique des transactions', schema: { example: [{ id: 'uuid', points: 50, source: 'ORDER', createdAt: '2026-05-14T10:00:00Z' }] } })
  getHistory(@GetUser('sub') userId: string) {
    return this.loyaltyService.getHistory(userId);
  }

  @Get('badges')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mes badges', description: 'Liste les badges débloqués par l\'utilisateur.' })
  @ApiResponse({ status: 200, description: 'Badges débloqués', schema: { example: [{ badge: { name: 'Premier achat', description: 'Badge pour le 1er achat' }, unlockedAt: '2026-05-14T10:00:00Z' }] } })
  getBadges(@GetUser('sub') userId: string) {
    return this.loyaltyService.getBadges(userId);
  }

  @Public()
  @Get('leaderboard')
  @ApiOperation({ summary: 'Classement général', description: 'Top utilisateurs par points de fidélité accumulés. Accessible sans authentification.' })
  @ApiResponse({ status: 200, description: 'Classement', schema: { example: [{ userId: 'uuid', _sum: { points: 500 } }] } })
  getLeaderboard() {
    return this.loyaltyService.getLeaderboard();
  }
}
