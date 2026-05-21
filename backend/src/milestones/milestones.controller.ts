import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
  };
}

@Controller('milestones')
@UseGuards(JwtAuthGuard)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() body: { title: string; date: string },
  ) {
    return this.milestonesService.create(req.user.sub, body.title, body.date);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.milestonesService.findAll(req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') milestoneId: string) {
    return this.milestonesService.remove(req.user.sub, milestoneId);
  }
}
