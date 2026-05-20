import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album } from '../schemas/album.schema';
import { Photo } from '../schemas/photo.schema';
import { PhotosService } from '../photos/photos.service';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<Album>,
    @InjectModel(Photo.name) private photoModel: Model<Photo>,
    private readonly photosService: PhotosService,
  ) {}

  async create(userId: string, title: string, coverPhotoUrl?: string) {
    const album = new this.albumModel({
      title,
      userId: new Types.ObjectId(userId),
      coverPhotoUrl: coverPhotoUrl || '',
    });
    return album.save();
  }

  async findAll(userId: string) {
    return this.albumModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(albumId: string, userId: string) {
    const album = await this.albumModel.findOne({
      _id: new Types.ObjectId(albumId),
      userId: new Types.ObjectId(userId),
    });
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  async update(userId: string, albumId: string, updateData: { title?: string; coverPhotoUrl?: string }) {
    const album = await this.albumModel.findOneAndUpdate(
      { _id: new Types.ObjectId(albumId), userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true }
    );
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  async remove(userId: string, albumId: string) {
    const album = await this.albumModel.findOne({
      _id: new Types.ObjectId(albumId),
      userId: new Types.ObjectId(userId),
    });
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Unassign photos that belonged to this album (keep photos, just remove album link)
    await this.photoModel.updateMany(
      { albumId: new Types.ObjectId(albumId), userId: new Types.ObjectId(userId) },
      { $set: { albumId: null } }
    );

    return this.albumModel.findByIdAndDelete(albumId);
  }

  /**
   * Deletes an album AND all its photos from both the database and Cloudinary.
   * Use this when the user explicitly wants to destroy all memories inside the album.
   */
  async removeWithPhotos(userId: string, albumId: string) {
    const album = await this.albumModel.findOne({
      _id: new Types.ObjectId(albumId),
      userId: new Types.ObjectId(userId),
    });
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Find all photos that belong to this album
    const albumPhotos = await this.photoModel.find({
      albumId: new Types.ObjectId(albumId),
      userId: new Types.ObjectId(userId),
    });

    // Delete each photo from Cloudinary + database via PhotosService
    await Promise.allSettled(
      albumPhotos.map((photo) =>
        this.photosService.remove(String(photo._id), userId),
      ),
    );

    return this.albumModel.findByIdAndDelete(albumId);
  }
}

