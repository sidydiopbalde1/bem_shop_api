import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderAdminFilterDto } from './dto/order.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Passer une commande', description: 'Crée une commande à partir des articles fournis. Vérifie le stock et calcule le total.' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès' })
  @ApiResponse({ status: 400, description: 'Stock insuffisant ou produit introuvable' })
  create(@GetUser('sub') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mes commandes', description: 'Liste toutes les commandes de l\'utilisateur connecté.' })
  @ApiResponse({ status: 200, description: 'Liste des commandes' })
  findAll(@GetUser('sub') userId: string) {
    return this.ordersService.findAll(userId);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin')
  @ApiOperation({ summary: 'Toutes les commandes paginées (admin)', description: 'Liste paginée de toutes les commandes avec filtres par statut et recherche email.' })
  @ApiResponse({ status: 200, description: 'Liste paginée', schema: { example: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 } } })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  findAllAdmin(@Query() filters: OrderAdminFilterDto) {
    return this.ordersService.findAllAdmin(filters);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Détail d\'une commande (admin)', description: 'Accès admin au détail d\'une commande sans vérification de propriété.' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Commande trouvée' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  findOneAdmin(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une commande' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Commande trouvée' })
  @ApiResponse({ status: 404, description: 'Commande introuvable ou accès refusé' })
  findOne(@GetUser('sub') userId: string, @Param('id') id: string) {
    return this.ordersService.findOne(id, userId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut (admin)', description: 'Permet à un admin de faire avancer le statut : PENDING → CONFIRMED → SHIPPED → DELIVERED, ou CANCELLED.' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
