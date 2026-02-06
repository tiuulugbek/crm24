import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/** Faqat super_admin roli uchun ruxsat beradi (rol va ruxsatlarni boshqarish). */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const roleName = user?.role?.name;
    if (roleName !== 'super_admin') {
      throw new ForbiddenException('Faqat Super admin ushbu amalni bajarishi mumkin');
    }
    return true;
  }
}
