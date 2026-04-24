import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config } from '../schemas/config.schema';

@Injectable()
export class ConfigService {
  constructor(@InjectModel(Config.name) private configModel: Model<Config>) {}

  async findOne() {
    let config = await this.configModel.findOne().exec();
    if (!config) {
      config = new this.configModel({});
      await config.save();
    }
    return config;
  }

  async update(data: any) {
    let config = await this.configModel.findOne().exec();
    if (config) {
      return this.configModel.findByIdAndUpdate(config._id, data, { new: true }).exec();
    } else {
      config = new this.configModel(data);
      return config.save();
    }
  }
}
