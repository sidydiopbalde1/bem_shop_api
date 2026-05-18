import {
  Controller, Post, UploadedFile, UploadedFiles,
  UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return cb(new BadRequestException('Format non supporté. Utilisez JPEG, PNG, WEBP ou GIF.'), false);
    }
    cb(null, true);
  },
};

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({
    summary: 'Uploader une image produit (admin)',
    description: 'Upload une image vers Cloudinary. Formats acceptés : JPEG, PNG, WEBP, GIF. Taille max : 5 Mo.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image produit (JPEG, PNG, WEBP, GIF — max 5 Mo)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploadée avec succès',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/products/abc123.jpg',
        publicId: 'products/abc123',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fichier manquant ou format invalide' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  async uploadOne(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier fourni.');
    const result = await this.cloudinaryService.uploadFile(file);
    return { url: result.secure_url, publicId: result.public_id };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({
    summary: 'Uploader plusieurs images produit (admin)',
    description: 'Upload jusqu\'à 10 images vers Cloudinary en une seule requête.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Images produit (max 10 fichiers, 5 Mo chacun)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploadées avec succès',
    schema: {
      example: [
        { url: 'https://res.cloudinary.com/demo/image/upload/v1234/products/abc.jpg', publicId: 'products/abc' },
        { url: 'https://res.cloudinary.com/demo/image/upload/v1234/products/def.jpg', publicId: 'products/def' },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Fichiers manquants ou format invalide' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  async uploadMany(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('Aucun fichier fourni.');
    const results = await this.cloudinaryService.uploadFiles(files);
    return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }
}
