import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.clientsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  async create(@Body() createClientDto: any) {
    return this.clientsService.create(createClientDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: any) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.clientsService.updateStatus(id, status, req.user.id);
  }

  @Post('merge')
  async mergeClients(
    @Body('primaryClientId') primaryClientId: string,
    @Body('secondaryClientId') secondaryClientId: string,
  ) {
    return this.clientsService.mergeClients(primaryClientId, secondaryClientId);
  }

  @Get(':id/status-history')
  async getStatusHistory(@Param('id') id: string) {
    return this.clientsService.getStatusHistory(id);
  }
}
