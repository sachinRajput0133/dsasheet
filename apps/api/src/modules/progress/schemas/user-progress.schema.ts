import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Problem', required: true })
  problemId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  completed: boolean;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);

// Compound unique index — ensures one record per user/problem pair
UserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
// Individual indexes for aggregation queries
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ problemId: 1 });
