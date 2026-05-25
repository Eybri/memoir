import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Photo } from '../schemas/photo.schema';
import { Album } from '../schemas/album.schema';
import { CloudinaryService } from './cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PhotosService {
  constructor(
    @InjectModel(Photo.name) private photoModel: Model<Photo>,
    @InjectModel(Album.name) private albumModel: Model<Album>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
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
    const accessibleAlbums = await this.albumModel.find({
      $or: [
        { userId: new Types.ObjectId(userId) },
        { sharedWith: new Types.ObjectId(userId) }
      ]
    });
    const accessibleAlbumIds = accessibleAlbums.map(a => a._id);

    return this.photoModel
      .find({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { albumId: { $in: accessibleAlbumIds } }
        ]
      })
      .populate({ path: 'captions.authorId', select: '_id name', model: 'User' })
      .sort({ takenAt: -1 })
      .exec();
  }

  async remove(photoId: string, userId: string) {
    const photo = await this.photoModel.findById(photoId);

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    let canDelete = false;
    if (photo.userId.toString() === userId) {
      canDelete = true;
    } else if (photo.albumId) {
      const album = await this.albumModel.findById(photo.albumId);
      if (album && album.userId.toString() === userId) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      throw new NotFoundException('Photo not found or unauthorized');
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

    const savedPhoto = await photo.save();

    // Trigger notification to other participants of the album
    if (photo.albumId) {
      try {
        const album = await this.albumModel
          .findById(photo.albumId)
          .populate('userId', '_id name email')
          .populate('sharedWith', '_id name email');

        if (album) {
          const author = await this.albumModel.db.model('User').findById(userId);
          const authorName = author?.name || 'Someone';

          const participants = [
            album.userId,
            ...(album.sharedWith || [])
          ];

          const otherParticipants = participants.filter(
            p => p._id.toString() !== userId
          );

          for (const participant of otherParticipants) {
            await this.notificationsService.create(
              participant._id.toString(),
              userId,
              'photo_caption_added',
              `${authorName} added a note to a photo in "${album.title}": "${text}"`,
              album._id.toString(),
              { albumTitle: album.title }
            );
          }
        }
      } catch (err) {
        console.error('Failed to notify participants on new caption/note', err);
      }
    }

    return savedPhoto;
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

  async bulkRemove(photoIds: string[], userId: string) {
    const objectIds = photoIds.map(id => new Types.ObjectId(id));
    
    const photos = await this.photoModel.find({ _id: { $in: objectIds } });
    if (photos.length === 0) return { deletedCount: 0 };

    const photosToDelete: any[] = [];

    for (const photo of photos) {
      if (photo.userId.toString() === userId) {
        photosToDelete.push(photo);
      } else if (photo.albumId) {
        const album = await this.albumModel.findById(photo.albumId);
        if (album && album.userId.toString() === userId) {
          photosToDelete.push(photo);
        }
      }
    }

    if (photosToDelete.length === 0) return { deletedCount: 0 };

    // Delete images from Cloudinary in parallel
    const deletePromises = photosToDelete
      .filter(p => p.publicId)
      .map(p => this.cloudinaryService.deleteImage(p.publicId));
    
    await Promise.allSettled(deletePromises);

    // Delete from MongoDB
    const idsToDelete = photosToDelete.map(p => p._id);
    const result = await this.photoModel.deleteMany({ _id: { $in: idsToDelete } });

    return { deletedCount: result.deletedCount };
  }
}
