import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/cart.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Voir le panier', description: 'Retourne le panier de l\'utilisateur connecté (créé s\'il n\'existe pas encore).' })
  @ApiResponse({ status: 200, description: 'Panier avec ses articles' })
  get(@GetUser('sub') userId: string) {
    return this.cartService.getOrCreate(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Ajouter ou mettre à jour un article', description: 'Si l\'article est déjà dans le panier, la quantité est mise à jour.' })
  @ApiResponse({ status: 201, description: 'Article ajouté/mis à jour' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  upsertItem(@GetUser('sub') userId: string, @Body() dto: UpsertCartItemDto) {
    return this.cartService.upsertItem(userId, dto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Retirer un article du panier' })
  @ApiParam({ name: 'productId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Article retiré' })
  @ApiResponse({ status: 404, description: 'Article introuvable dans le panier' })
  removeItem(@GetUser('sub') userId: string, @Param('productId') productId: string) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Vider le panier', description: 'Supprime tous les articles du panier.' })
  @ApiResponse({ status: 200, description: 'Panier vidé' })
  clear(@GetUser('sub') userId: string) {
    return this.cartService.clear(userId);
  }
}
