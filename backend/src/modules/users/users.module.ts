import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  providers: [UsersService, SuperAdminGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
