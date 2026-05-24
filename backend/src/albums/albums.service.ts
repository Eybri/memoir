import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album } from '../schemas/album.schema';
import { Photo } from '../schemas/photo.schema';
import { PhotosService } from '../photos/photos.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<Album>,
    @InjectModel(Photo.name) private photoModel: Model<Photo>,
    private readonly photosService: PhotosService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, title: string, coverPhotoUrl?: string, sharedWith?: string[]) {
    const album = new this.albumModel({
      title,
      userId: new Types.ObjectId(userId),
      coverPhotoUrl: coverPhotoUrl || '',
      sharedWith: sharedWith?.map(id => new Types.ObjectId(id)) || [],
    });
    const savedAlbum = await album.save();
    try {
      const populated = await savedAlbum.populate('userId', '_id name email');
      const ownerName = (populated.userId as any)?.name || 'Someone';
      if (sharedWith && sharedWith.length > 0) {
        for (const recipientId of sharedWith) {
          await this.notificationsService.create(
            recipientId,
            userId,
            'album_shared',
            `${ownerName} shared an album with you: "${title}".`,
            savedAlbum._id.toString(),
            { albumTitle: title }
          );
        }
      }
    } catch (err) {
      console.error(`Failed to handle notifications for shared album ${title}`, err);
    }
    return savedAlbum;
  }

  async findAll(userId: string) {
    return this.albumModel
      .find({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { sharedWith: new Types.ObjectId(userId) }
        ]
      })
      .populate('userId', '_id name email')
      .populate('sharedWith', '_id name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(albumId: string, userId: string) {
    const album = await this.albumModel.findOne({
      _id: new Types.ObjectId(albumId),
      $or: [
        { userId: new Types.ObjectId(userId) },
        { sharedWith: new Types.ObjectId(userId) }
      ]
    })
    .populate('userId', '_id name email')
    .populate('sharedWith', '_id name email');
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  async update(userId: string, albumId: string, updateData: { title?: string; coverPhotoUrl?: string, sharedWith?: string[] }) {
    // Fetch old album to compare sharedWith
    const oldAlbum = await this.albumModel.findById(albumId);
    const oldSharedWith = oldAlbum?.sharedWith?.map(id => id.toString()) || [];

    const updateObj: any = { ...updateData };
    if (updateData.sharedWith) {
      updateObj.sharedWith = updateData.sharedWith.map(id => new Types.ObjectId(id));
    }
    const album = await this.albumModel.findOneAndUpdate(
      { _id: new Types.ObjectId(albumId), userId: new Types.ObjectId(userId) },
      { $set: updateObj },
      { new: true }
    ).populate('userId', '_id name email');

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Notify newly added users
    if (updateData.sharedWith) {
      const newSharedWith = updateData.sharedWith.filter(id => !oldSharedWith.includes(id));
      const ownerName = (album.userId as any)?.name || 'Someone';
      for (const recipientId of newSharedWith) {
        try {
          await this.notificationsService.create(
            recipientId,
            userId,
            'album_shared',
            `${ownerName} shared an album with you: "${album.title}".`,
            album._id.toString(),
            { albumTitle: album.title }
          );
        } catch (err) {
          console.error(`Failed to create notification for updated shared album ${album.title} to user ${recipientId}`, err);
        }
      }
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

