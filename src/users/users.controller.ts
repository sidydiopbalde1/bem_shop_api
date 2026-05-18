import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserFilterDto, UpdateUserRoleDto } from './dto/user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des utilisateurs (admin)', description: 'Recherche et filtre paginé sur tous les utilisateurs.' })
  @ApiResponse({ status: 200, description: 'Liste paginée', schema: { example: { data: [], total: 0, page: 1, limit: 20 } } })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  findAll(@Query() filters: UserFilterDto) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un utilisateur (admin)' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Changer le rôle d\'un utilisateur (admin)' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspendre un utilisateur (admin)', description: 'Désactive le compte et invalide le refresh token.' })
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Utilisateur suspendu' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  suspend(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }
}
