import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Config extends Document {
  @Prop({ default: 'Her' })
  recipientName: string;

  @Prop()
  revealDate: Date;

  @Prop({
    enum: ['one_big_reveal', 'timed_drip', 'geofenced'],
    default: 'one_big_reveal',
  })
  deliveryMode: string;

  @Prop({ default: false })
  isShared: boolean;

  @Prop()
  sharedAt: Date;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
