import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album } from '../schemas/album.schema';
import { Photo } from '../schemas/photo.schema';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<Album>,
    @InjectModel(Photo.name) private photoModel: Model<Photo>,
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

    // Unassign photos that belonged to this album
    await this.photoModel.updateMany(
      { albumId: new Types.ObjectId(albumId), userId: new Types.ObjectId(userId) },
      { $set: { albumId: null } }
    );

    return this.albumModel.findByIdAndDelete(albumId);
  }
}
