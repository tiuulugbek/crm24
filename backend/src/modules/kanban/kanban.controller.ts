import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KanbanService } from './kanban.service';

@Controller('kanban')
@UseGuards(AuthGuard('jwt'))
export class KanbanController {
  constructor(private kanbanService: KanbanService) {}

  @Get('statuses')
  getStatuses() {
    return this.kanbanService.getStatuses();
  }

  @Post('statuses')
  createStatus(@Body() dto: any) {
    return this.kanbanService.createStatus(dto);
  }

  @Put('statuses/:id')
  updateStatus(@Param('id') id: string, @Body() dto: any) {
    return this.kanbanService.updateStatus(id, dto);
  }

  @Delete('statuses/:id')
  deleteStatus(@Param('id') id: string) {
    return this.kanbanService.deleteStatus(id);
  }

  @Put('statuses/reorder')
  reorderStatuses(@Body('statusIds') statusIds: string[]) {
    return this.kanbanService.reorderStatuses(statusIds || []);
  }
}
