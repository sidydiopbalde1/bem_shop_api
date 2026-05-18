import {
  Controller, Get, Post, Patch, Delete,
  Param, Body,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ─── Lecture publique ───────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des catégories',
    description: 'Retourne toutes les catégories racines avec leurs sous-catégories (2 niveaux) et le nombre de produits.',
  })
  @ApiResponse({
    status: 200,
    description: 'Arbre des catégories',
    schema: {
      example: [{
        id: 'uuid', name: 'Vêtements', slug: 'vetements', parentId: null,
        children: [{ id: 'uuid2', name: 'Hoodies', slug: 'hoodies', _count: { products: 5 } }],
        _count: { products: 12 },
      }],
    },
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une catégorie' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée avec ses sous-catégories et sa parente' })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // ─── Administration ─────────────────────────────────────────────────────────

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Créer une catégorie (admin)',
    description: 'Le slug est généré automatiquement depuis le nom si non fourni. Spécifiez `parentId` pour créer une sous-catégorie.',
  })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée',
    schema: { example: { id: 'uuid', name: 'Vêtements', slug: 'vetements', parentId: null } },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Catégorie parente introuvable' })
  @ApiResponse({ status: 409, description: 'Slug déjà utilisé' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Modifier une catégorie (admin)',
    description: 'Si `name` est modifié sans fournir de `slug`, le slug est regénéré automatiquement.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Catégorie mise à jour' })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  @ApiResponse({ status: 409, description: 'Slug déjà utilisé' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Supprimer une catégorie (admin)',
    description: 'La suppression est bloquée si des produits ou des sous-catégories y sont rattachés.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée' })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  @ApiResponse({ status: 409, description: 'Suppression impossible — produits ou sous-catégories liés' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
