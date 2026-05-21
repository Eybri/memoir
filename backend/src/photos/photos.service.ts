import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Photo } from '../schemas/photo.schema';
import { Album } from '../schemas/album.schema';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class PhotosService {
  constructor(
    @InjectModel(Photo.name) private photoModel: Model<Photo>,
    @InjectModel(Album.name) private albumModel: Model<Album>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, url: string, publicId: string) {
    const photo = new this.photoModel({
      url,
      publicId,
      userId: new Types.ObjectId(userId),
      takenAt: new Date(),
    });
    return photo.save();
  }

  async findAll(userId: string) {
    const sharedAlbums = await this.albumModel.find({ sharedWith: new Types.ObjectId(userId) });
    const sharedAlbumIds = sharedAlbums.map(a => a._id);

    return this.photoModel
      .find({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { albumId: { $in: sharedAlbumIds } }
        ]
      })
      .sort({ takenAt: -1 })
      .exec();
  }

  async remove(photoId: string, userId: string) {
    const photo = await this.photoModel.findOne({
      _id: new Types.ObjectId(photoId),
      userId: new Types.ObjectId(userId),
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.publicId) {
      await this.cloudinaryService.deleteImage(photo.publicId);
    }

    return this.photoModel.findByIdAndDelete(photoId);
  }

  async addCaption(photoId: string, userId: string, text: string) {
    const photo = await this.photoModel.findById(photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    photo.captions.push({
      text,
      authorId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return photo.save();
  }

  async searchByCaption(userId: string, query: string) {
    return this.photoModel
      .find({
        userId: new Types.ObjectId(userId),
        'captions.text': { $regex: query, $options: 'i' },
      })
      .exec();
  }

  async updateAlbum(photoId: string, userId: string, albumId: string | null) {
    const photo = await this.photoModel.findOne({
      _id: new Types.ObjectId(photoId),
      userId: new Types.ObjectId(userId),
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    photo.albumId = albumId ? new Types.ObjectId(albumId) : null;
    return photo.save();
  }
}
