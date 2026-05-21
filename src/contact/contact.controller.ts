import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envoyer un message de contact' })
  @ApiResponse({ status: 201, description: 'Message enregistré' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lister les messages de contact (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des messages' })
  findAll() {
    return this.contactService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/read')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marquer un message comme lu (admin)' })
  @ApiParam({ name: 'id', description: 'ID du message' })
  @ApiResponse({ status: 200, description: 'Message marqué comme lu' })
  @ApiResponse({ status: 404, description: 'Message introuvable' })
  markRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer un message de contact (admin)' })
  @ApiParam({ name: 'id', description: 'ID du message' })
  @ApiResponse({ status: 200, description: 'Message supprimé' })
  @ApiResponse({ status: 404, description: 'Message introuvable' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
