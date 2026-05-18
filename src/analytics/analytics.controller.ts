import { Controller, Get, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiProduces,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Résumé des ventes (admin)', description: 'Retourne les KPIs globaux : nombre de commandes, chiffre d\'affaires, nombre d\'utilisateurs, produits en attente.' })
  @ApiResponse({
    status: 200, description: 'KPIs globaux',
    schema: { example: { totalOrders: 142, totalRevenue: 2850000, totalUsers: 98, pendingProducts: 5 } },
  })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  summary() {
    return this.analyticsService.getSalesSummary();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Ventes par jour (admin)', description: 'Agrège le nombre de commandes et le chiffre d\'affaires par jour sur la période demandée.' })
  @ApiQuery({ name: 'days', required: false, example: '30', description: 'Nombre de jours à analyser (défaut : 30)' })
  @ApiResponse({ status: 200, description: 'Données jour par jour', schema: { example: [{ createdAt: '2026-05-14T00:00:00Z', _count: 8, _sum: { totalAmount: 120000 } }] } })
  sales(@Query('days') days?: string) {
    return this.analyticsService.getSalesByDay(days ? parseInt(days) : 30);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Produits les plus vendus (admin)' })
  @ApiQuery({ name: 'limit', required: false, example: '10', description: 'Nombre de produits à retourner (défaut : 10)' })
  @ApiResponse({ status: 200, description: 'Top produits par quantité vendue', schema: { example: [{ productId: 'uuid', _sum: { quantity: 120 } }] } })
  topProducts(@Query('limit') limit?: string) {
    return this.analyticsService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get('export/orders')
  @ApiProduces('text/csv')
  @ApiOperation({ summary: 'Exporter les commandes en CSV (admin)', description: 'Télécharge un fichier CSV avec toutes les commandes et leurs détails.' })
  @ApiResponse({ status: 200, description: 'Fichier CSV', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } })
  async exportOrders(@Res() res: Response) {
    const csv = await this.analyticsService.exportOrdersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  }
}
