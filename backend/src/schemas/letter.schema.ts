import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Letter extends Document {
  @Prop()
  caption: string;

  @Prop({
    enum: ['text', 'voice', 'photo', 'video', 'audio'],
    default: 'photo',
  })
  type: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ type: Object })
  location: {
    lat: number;
    lng: number;
    name: string;
  };

  @Prop({ default: false })
  isOpened: boolean;

  @Prop({ default: false })
  hearted: boolean;

  @Prop()
  reply: string;
}

export const LetterSchema = SchemaFactory.createForClass(Letter);
