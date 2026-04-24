import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { Photo, PhotoSchema } from '../schemas/photo.schema';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }]),
    AuthModule,
  ],
  controllers: [PhotosController],
  providers: [PhotosService, CloudinaryService]
})
export class PhotosModule {}
