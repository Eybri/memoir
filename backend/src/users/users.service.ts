import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { FriendRequest } from '../schemas/friend-request.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async searchByEmail(email: string, currentUserId: string) {
    if (!email) return [];
    
    return this.userModel.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: new Types.ObjectId(currentUserId) }
    }).select('_id name email').exec();
  }

  async getFriends(userId: string) {
    const user = await this.userModel.findById(userId).populate('friends', '_id name email').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.friends;
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    const sender = await this.userModel.findById(senderId);
    if (sender?.friends.includes(new Types.ObjectId(receiverId))) {
      throw new BadRequestException('Already friends');
    }

    const existing = await this.friendRequestModel.findOne({
      $or: [
        { senderId: new Types.ObjectId(senderId), receiverId: new Types.ObjectId(receiverId), status: 'pending' },
        { senderId: new Types.ObjectId(receiverId), receiverId: new Types.ObjectId(senderId), status: 'pending' }
      ]
    });
    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    const req = new this.friendRequestModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
    });
    const savedRequest = await req.save();
    try {
      await this.notificationsService.create(
        receiverId,
        senderId,
        'friend_request_received',
        `${sender?.name || 'Someone'} sent you a friend request.`,
        savedRequest._id.toString()
      );
    } catch (err) {
      console.error('Failed to create notification for friend request', err);
    }
    return savedRequest;
  }

  async getPendingRequests(userId: string) {
    return this.friendRequestModel.find({
      receiverId: new Types.ObjectId(userId),
      status: 'pending'
    }).populate('senderId', '_id name email').exec();
  }

  async getSentRequests(userId: string) {
    return this.friendRequestModel.find({
      senderId: new Types.ObjectId(userId),
      status: 'pending'
    }).populate('receiverId', '_id name email').exec();
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestModel.findOneAndUpdate(
      { _id: new Types.ObjectId(requestId), receiverId: new Types.ObjectId(userId), status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );
    if (!request) throw new NotFoundException('Request not found or already processed');

    await this.userModel.findByIdAndUpdate(userId, { $addToSet: { friends: request.senderId } });
    await this.userModel.findByIdAndUpdate(request.senderId, { $addToSet: { friends: new Types.ObjectId(userId) } });

    try {
      const acceptor = await this.userModel.findById(userId);
      await this.notificationsService.create(
        String(request.senderId),
        userId,
        'friend_request_accepted',
        `${acceptor?.name || 'Someone'} accepted your friend request.`,
        requestId
      );
    } catch (err) {
      console.error('Failed to create notification for accepted friend request', err);
    }

    return { success: true };
  }

  async rejectFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestModel.findOneAndUpdate(
      { _id: new Types.ObjectId(requestId), receiverId: new Types.ObjectId(userId), status: 'pending' },
      { status: 'rejected' },
      { new: true }
    );
    if (!request) throw new NotFoundException('Request not found or already processed');

    return { success: true };
  }

  async removeFriend(userId: string, friendId: string) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: new Types.ObjectId(friendId) } },
      { new: true }
    ).populate('friends', '_id name email').exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser.friends;
  }
}
