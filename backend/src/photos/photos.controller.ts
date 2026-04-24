import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Body, 
  UseGuards, 
  Request, 
  Param, 
  Query, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(
    private readonly photosService: PhotosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);
    return this.photosService.create(req.user.sub, result.secure_url, result.public_id);
  }

  @Get()
  findAll(@Request() req) {
    return this.photosService.findAll(req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') photoId: string) {
    return this.photosService.remove(photoId, req.user.sub);
  }

  @Post(':id/caption')
  addCaption(
    @Request() req,
    @Param('id') photoId: string,
    @Body() body: { text: string },
  ) {
    return this.photosService.addCaption(photoId, req.user.sub, body.text);
  }

  @Get('search')
  search(@Request() req, @Query('q') query: string) {
    return this.photosService.searchByCaption(req.user.sub, query);
  }
}
