import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async create(
    recipientId: string,
    senderId: string | undefined,
    type: string,
    message: string,
    relatedId?: string,
    metadata?: Record<string, any>,
  ) {
    const notification = new this.notificationModel({
      recipientId: new Types.ObjectId(recipientId),
      senderId: senderId ? new Types.ObjectId(senderId) : undefined,
      type,
      message,
      isRead: false,
      relatedId: relatedId ? new Types.ObjectId(relatedId) : undefined,
      metadata,
    });
    return notification.save();
  }

  async findAllForUser(userId: string) {
    return this.notificationModel
      .find({ recipientId: new Types.ObjectId(userId) })
      .populate('senderId', '_id name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), recipientId: new Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true },
    );
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } },
    );
    return { success: true };
  }

  async delete(notificationId: string, userId: string) {
    const result = await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
      recipientId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { success: true };
  }
}
