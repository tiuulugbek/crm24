import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('roles/permissions')
  @UseGuards(SuperAdminGuard)
  getPermissions() {
    return this.usersService.getAllPermissions();
  }

  @Get('roles/with-permissions')
  @UseGuards(SuperAdminGuard)
  getRolesWithPermissions() {
    return this.usersService.getRolesWithPermissions();
  }

  @Put('roles/:roleId/permissions')
  @UseGuards(SuperAdminGuard)
  setRolePermissions(@Param('roleId') roleId: string, @Body() body: { permissionIds: string[] }) {
    return this.usersService.setRolePermissions(roleId, body.permissionIds || []);
  }

  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
