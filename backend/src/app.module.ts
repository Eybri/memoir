import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { LettersModule } from './letters/letters.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { PhotosModule } from './photos/photos.module';
import { AlbumsModule } from './albums/albums.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    LettersModule,
    ConfigModule,
    AuthModule,
    PhotosModule,
    AlbumsModule,
  ],
})
export class AppModule {}
