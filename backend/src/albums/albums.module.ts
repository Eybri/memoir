import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { Album, AlbumSchema } from '../schemas/album.schema';
import { Photo, PhotoSchema } from '../schemas/photo.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Album.name, schema: AlbumSchema },
      { name: Photo.name, schema: PhotoSchema },
    ]),
    AuthModule,
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
