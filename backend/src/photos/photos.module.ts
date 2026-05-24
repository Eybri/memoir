import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { Photo, PhotoSchema } from '../schemas/photo.schema';
import { Album, AlbumSchema } from '../schemas/album.schema';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './cloudinary.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Photo.name, schema: PhotoSchema },
      { name: Album.name, schema: AlbumSchema }
    ]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [PhotosController],
  providers: [PhotosService, CloudinaryService],
  exports: [PhotosService],
})
export class PhotosModule {}
