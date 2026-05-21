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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
  };
}

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(
    private readonly photosService: PhotosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file);
    if ('secure_url' in result && 'public_id' in result) {
      return this.photosService.create(
        req.user.sub,
        result.secure_url as string,
        result.public_id as string,
      );
    }
    throw new Error('Cloudinary upload did not return a valid URL');
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.photosService.findAll(req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') photoId: string) {
    return this.photosService.remove(photoId, req.user.sub);
  }

  @Post('bulk-delete')
  bulkRemove(@Request() req: AuthenticatedRequest, @Body() body: { photoIds: string[] }) {
    return this.photosService.bulkRemove(body.photoIds, req.user.sub);
  }

  @Post(':id/caption')
  addCaption(
    @Request() req: AuthenticatedRequest,
    @Param('id') photoId: string,
    @Body() body: { text: string },
  ) {
    return this.photosService.addCaption(photoId, req.user.sub, body.text);
  }

  @Patch(':id/album')
  updateAlbum(
    @Request() req: AuthenticatedRequest,
    @Param('id') photoId: string,
    @Body() body: { albumId: string | null },
  ) {
    return this.photosService.updateAlbum(photoId, req.user.sub, body.albumId);
  }

  @Get('search')
  search(@Request() req: AuthenticatedRequest, @Query('q') query: string) {
    return this.photosService.searchByCaption(req.user.sub, query);
  }
}
