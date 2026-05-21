import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
  };
}

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() body: { title: string; coverPhotoUrl?: string; sharedWith?: string[] },
  ) {
    return this.albumsService.create(req.user.sub, body.title, body.coverPhotoUrl, body.sharedWith);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.albumsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') albumId: string) {
    return this.albumsService.findOne(albumId, req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') albumId: string,
    @Body() body: { title?: string; coverPhotoUrl?: string; sharedWith?: string[] },
  ) {
    return this.albumsService.update(req.user.sub, albumId, body);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') albumId: string) {
    return this.albumsService.remove(req.user.sub, albumId);
  }
}
