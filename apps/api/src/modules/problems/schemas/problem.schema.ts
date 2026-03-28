import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProblemDocument = Problem & Document;

@Schema({ timestamps: true })
export class Problem {
  @Prop({ type: Types.ObjectId, ref: 'Topic', required: true, index: true })
  topicId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true,
  })
  difficulty: 'Easy' | 'Medium' | 'Hard';

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: String, default: '' })
  youtubeLink: string;

  @Prop({ type: String, default: '' })
  codingLink: string;

  @Prop({ type: String, default: '' })
  articleLink: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);
// Compound index for filtering by topic + difficulty
ProblemSchema.index({ topicId: 1, difficulty: 1 });
