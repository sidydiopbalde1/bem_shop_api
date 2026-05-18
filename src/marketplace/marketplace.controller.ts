import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { SubmitProductDto } from './dto/marketplace.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Marketplace')
@ApiBearerAuth('access-token')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('products')
  @ApiOperation({ summary: 'Soumettre un produit', description: 'Un vendeur soumet un produit pour validation par l\'admin. Le produit est créé avec isApproved = false.' })
  @ApiResponse({ status: 201, description: 'Produit soumis, en attente de validation' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  submit(@GetUser('sub') vendorId: string, @Body() dto: SubmitProductDto) {
    return this.marketplaceService.submitProduct(vendorId, dto);
  }

  @Get('my-products')
  @ApiOperation({ summary: 'Mes produits soumis', description: 'Liste les produits soumis par le vendeur connecté (approuvés et en attente).' })
  @ApiResponse({ status: 200, description: 'Liste des produits du vendeur' })
  myProducts(@GetUser('sub') vendorId: string) {
    return this.marketplaceService.getMyProducts(vendorId);
  }

  @Roles(UserRole.ADMIN)
  @Get('pending')
  @ApiOperation({ summary: 'Produits en attente (admin)', description: 'Liste tous les produits soumis et non encore approuvés.' })
  @ApiResponse({ status: 200, description: 'Produits en attente de validation' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  pending() {
    return this.marketplaceService.getPendingProducts();
  }

  @Roles(UserRole.ADMIN)
  @Patch('products/:id/approve')
  @ApiOperation({ summary: 'Approuver un produit (admin)' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Produit approuvé et visible dans le catalogue' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  approve(@Param('id') id: string) {
    return this.marketplaceService.approveProduct(id);
  }

  @Roles(UserRole.ADMIN)
  @Delete('products/:id/reject')
  @ApiOperation({ summary: 'Rejeter un produit (admin)', description: 'Supprime définitivement un produit soumis refusé.' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Produit rejeté et supprimé' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  reject(@Param('id') id: string) {
    return this.marketplaceService.rejectProduct(id);
  }
}
