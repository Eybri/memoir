import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Letter } from '../schemas/letter.schema';
import { Config } from '../schemas/config.schema';

@Injectable()
export class LettersService {
  constructor(
    @InjectModel(Letter.name) private letterModel: Model<Letter>,
    @InjectModel(Config.name) private configModel: Model<Config>,
  ) {}

  async findAll() {
    const config = await this.configModel.findOne();
    let letters = await this.letterModel.find().sort({ createdAt: -1 }).exec();

    if (!config) return letters;

    if (config.deliveryMode === 'timed_drip' && config.isShared) {
      const weeksSinceShare = Math.floor((new Date().getTime() - new Date(config.sharedAt).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      letters = letters.slice(0, weeksSinceShare);
    }

    return letters;
  }

  async create(data: any) {
    const newLetter = new this.letterModel(data);
    return newLetter.save();
  }

  async update(id: string, updates: any) {
    return this.letterModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}
