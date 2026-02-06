import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BranchesModule } from './modules/branches/branches.module';
import { UsersModule } from './modules/users/users.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { MessagesModule } from './modules/messages/messages.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { SmsModule } from './modules/sms/sms.module';
import {
  Integration,
  KanbanStatus,
  ClientStatusHistory,
  SmsLog,
  AnalyticsSnapshot,
  ActivityLog,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          __dirname + '/**/*.entity{.ts,.js}',
          Integration,
          KanbanStatus,
          ClientStatusHistory,
          SmsLog,
          AnalyticsSnapshot,
          ActivityLog,
        ],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    ClientsModule,
    BranchesModule,
    UsersModule,
    KanbanModule,
    MessagesModule,
    IntegrationsModule,
    SmsModule,
  ],
})
export class AppModule {}
