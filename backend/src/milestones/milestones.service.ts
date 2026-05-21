import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Milestone } from '../schemas/milestone.schema';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectModel(Milestone.name) private milestoneModel: Model<Milestone>,
  ) {}

  async create(userId: string, title: string, date: string): Promise<Milestone> {
    const createdMilestone = new this.milestoneModel({
      userId,
      title,
      date: new Date(date),
    });
    return createdMilestone.save();
  }

  async findAll(userId: string): Promise<Milestone[]> {
    return this.milestoneModel.find({ userId }).sort({ date: 1 }).exec();
  }

  async remove(userId: string, milestoneId: string): Promise<{ success: boolean }> {
    const result = await this.milestoneModel.deleteOne({ _id: milestoneId, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Milestone not found');
    }
    return { success: true };
  }
}
