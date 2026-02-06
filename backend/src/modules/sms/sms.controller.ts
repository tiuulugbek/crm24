import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SmsService } from './sms.service';

@Controller('sms')
@UseGuards(AuthGuard('jwt'))
export class SmsController {
  constructor(private smsService: SmsService) {}

  @Post('send')
  async send(
    @Body() body: { clientId: string; branchId: string; phoneNumber: string },
    @Request() req: any,
  ) {
    return this.smsService.sendSms({
      clientId: body.clientId,
      branchId: body.branchId,
      phoneNumber: body.phoneNumber,
      userId: req.user?.id,
    });
  }

  @Get('history')
  async history(@Query('clientId') clientId?: string, @Query('branchId') branchId?: string) {
    return this.smsService.getSmsHistory(clientId, branchId);
  }
}
