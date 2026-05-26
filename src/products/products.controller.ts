import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UploadedFiles, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto, SetThresholdDto } from './dto/product.dto';
import { CloudinaryService } from '../upload/cloudinary.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return cb(new BadRequestException('Format non supporté. Utilisez JPEG, PNG, WEBP ou GIF.'), false);
    }
    cb(null, true);
  },
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── Lecture publique ───────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liste des produits', description: 'Catalogue public paginé avec filtres optionnels.' })
  @ApiResponse({ status: 200, description: 'Liste paginée des produits', schema: { example: { data: [], total: 0, page: 1, limit: 20 } } })
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  // Doit être AVANT /:id pour éviter le conflit de route
  @Roles(UserRole.ADMIN)
  @Get('below-threshold')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Produits sous le seuil d\'alerte (admin)',
    description: 'Retourne tous les produits dont le stock actuel est inférieur ou égal à leur seuil configuré.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits en alerte',
    schema: {
      example: [
        { id: '...', productName: 'Hoodie BEM', stock: 3, threshold: 5 },
      ],
    },
  })
  findBelowThreshold() {
    return this.productsService.findBelowThreshold();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un produit' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Produit trouvé' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ─── Création ───────────────────────────────────────────────────────────────

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiBearerAuth('access-token')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Créer un produit (admin)',
    description: 'Crée un produit avec upload d\'images vers Cloudinary. Jusqu\'à 10 images, JPEG/PNG/WEBP/GIF, max 5 Mo chacune.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'price', 'stock', 'categoryId'],
      properties: {
        name:          { type: 'string', example: 'Hoodie BEM 2024' },
        description:   { type: 'string', example: 'Hoodie officiel de la promotion BEM 2024, coton premium.' },
        price:         { type: 'number', example: 15000, description: 'Prix de vente en FCFA' },
        purchasePrice: { type: 'number', example: 8000, description: 'Prix d\'achat (coût) en FCFA — admin uniquement' },
        stock:         { type: 'number', example: 50, description: 'Quantité en stock' },
        categoryId:    { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Images produit (max 10, JPEG/PNG/WEBP/GIF, 5 Mo chacune)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Produit créé avec les URLs Cloudinary dans imageUrls' })
  @ApiResponse({ status: 400, description: 'Données invalides ou format d\'image non supporté' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageUrls = files?.length
      ? (await this.cloudinaryService.uploadFiles(files)).map((r) => r.secure_url)
      : [];
    return this.productsService.create({ ...dto, imageUrls });
  }

  // ─── Mise à jour ────────────────────────────────────────────────────────────

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Modifier un produit (admin)',
    description: 'Met à jour un produit. Si de nouvelles images sont fournies, elles remplacent les images existantes.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:          { type: 'string', example: 'Hoodie BEM 2024 — Édition limitée' },
        description:   { type: 'string', example: 'Description mise à jour.' },
        price:         { type: 'number', example: 18000, description: 'Prix de vente en FCFA' },
        purchasePrice: { type: 'number', example: 9000, nullable: true, description: 'Prix d\'achat en FCFA (null pour effacer)' },
        stock:         { type: 'number', example: 30 },
        isApproved:    { type: 'boolean', example: true },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Nouvelles images (remplacent les existantes si fournies)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Produit mis à jour' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageUrls = files?.length
      ? (await this.cloudinaryService.uploadFiles(files)).map((r) => r.secure_url)
      : undefined;
    return this.productsService.update(id, { ...dto, ...(imageUrls && { imageUrls }) });
  }

  // ─── Seuil d'alerte stock ───────────────────────────────────────────────────

  @Roles(UserRole.ADMIN)
  @Patch(':id/threshold')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Définir ou supprimer le seuil d\'alerte de stock (admin)',
    description: 'Définit la valeur de stock en dessous de laquelle une alerte est déclenchée. Envoyer `{ "threshold": null }` pour supprimer le seuil.',
  })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        threshold: { type: 'number', nullable: true, example: 5, description: 'Seuil en unités (null pour supprimer)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Seuil mis à jour', schema: { example: { id: '...', name: 'Hoodie BEM', stock: 3, stockThreshold: 5 } } })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  setThreshold(@Param('id') id: string, @Body() dto: SetThresholdDto) {
    const threshold = dto.threshold !== undefined ? dto.threshold : null;
    return this.productsService.setThreshold(id, threshold);
  }

  // ─── Suppression ────────────────────────────────────────────────────────────

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer un produit (admin)' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Produit supprimé' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
