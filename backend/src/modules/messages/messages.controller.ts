import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  getConversations() {
    return this.messagesService.getConversations();
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string) {
    return this.messagesService.getMessages(id);
  }

  @Post('send')
  sendMessage(@Body() body: { conversationId: string; content: string }, @Request() req: any) {
    return this.messagesService.sendMessage(body.conversationId, body.content, req.user?.id);
  }

  @Put('conversations/:id/read')
  markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(id);
  }
}
