import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async search(@Query('email') email: string, @Request() req) {
    return this.usersService.searchByEmail(email, req.user.sub);
  }

  @Get('friends')
  async getFriends(@Request() req) {
    return this.usersService.getFriends(req.user.sub);
  }

  @Post('friend-requests/:receiverId')
  async sendFriendRequest(@Param('receiverId') receiverId: string, @Request() req) {
    return this.usersService.sendFriendRequest(req.user.sub, receiverId);
  }

  @Get('friend-requests/sent')
  async getSentRequests(@Request() req) {
    return this.usersService.getSentRequests(req.user.sub);
  }

  @Get('friend-requests/pending')
  async getPendingRequests(@Request() req) {
    return this.usersService.getPendingRequests(req.user.sub);
  }

  @Post('friend-requests/:requestId/accept')
  async acceptFriendRequest(@Param('requestId') requestId: string, @Request() req) {
    return this.usersService.acceptFriendRequest(req.user.sub, requestId);
  }

  @Post('friend-requests/:requestId/reject')
  async rejectFriendRequest(@Param('requestId') requestId: string, @Request() req) {
    return this.usersService.rejectFriendRequest(req.user.sub, requestId);
  }

  @Delete('friends/:friendId')
  async removeFriend(@Param('friendId') friendId: string, @Request() req) {
    return this.usersService.removeFriend(req.user.sub, friendId);
  }
}
