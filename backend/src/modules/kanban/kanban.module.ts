import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanStatus } from '../../entities';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanStatus])],
  providers: [KanbanService],
  controllers: [KanbanController],
  exports: [KanbanService],
})
export class KanbanModule {}
