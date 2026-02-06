import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  getAll() {
    return this.integrationsService.findAll();
  }

  @Post('configure')
  configure(
    @Request() req: any,
    @Body() body: { platform: string; name?: string; config?: Record<string, any>; termsAcceptedAt?: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Foydalanuvchi aniqlanmadi');
    return this.integrationsService.configure(
      body.platform,
      body.name ?? null,
      body.config || {},
      userId,
      body.termsAcceptedAt,
    );
  }

  @Put(':id/toggle')
  toggle(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.integrationsService.toggle(id, body.isActive === true);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.integrationsService.delete(id);
  }
}
