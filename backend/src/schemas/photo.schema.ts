import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Photo extends Document {
  @Prop({ required: true })
  url: string;

  @Prop()
  publicId: string; // Cloudinary public ID

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: [] })
  captions: {
    text: string;
    authorId: Types.ObjectId;
    createdAt: Date;
  }[];

  @Prop()
  takenAt: Date;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
