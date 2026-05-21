import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Mes adresses de livraison' })
  @ApiResponse({ status: 200, description: 'Liste des adresses' })
  findAll(@GetUser('sub') userId: string) {
    return this.addressesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter une adresse' })
  @ApiResponse({ status: 201, description: 'Adresse créée' })
  create(@GetUser('sub') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(userId, dto);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Modifier une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse modifiée' })
  update(@GetUser('sub') userId: string, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Supprimer une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse supprimée' })
  remove(@GetUser('sub') userId: string, @Param('id') id: string) {
    return this.addressesService.remove(userId, id);
  }

  @Patch(':id/default')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Définir comme adresse par défaut' })
  @ApiResponse({ status: 200, description: 'Adresse définie par défaut' })
  setDefault(@GetUser('sub') userId: string, @Param('id') id: string) {
    return this.addressesService.setDefault(userId, id);
  }
}
