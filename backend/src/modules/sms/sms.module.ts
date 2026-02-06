import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { SmsLog } from '../../entities/index';
import { Integration } from '../../entities/index';
import { Client } from '../../entities/client.entity';
import { Branch } from '../../entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SmsLog, Client, Branch, Integration]),
  ],
  providers: [SmsService],
  controllers: [SmsController],
  exports: [SmsService],
})
export class SmsModule {}
