import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from '../../entities/client.entity';
import { ClientChannel } from '../../entities/client-channel.entity';
import { Branch } from '../../entities/branch.entity';
import { ClientStatusHistory } from '../../entities/index';
import { ActivityLog } from '../../entities/index';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientChannel, Branch, ClientStatusHistory, ActivityLog])],
  providers: [ClientsService],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
