import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProgress, UserProgressDocument } from './schemas/user-progress.schema';
import { Problem, ProblemDocument } from '../problems/schemas/problem.schema';
import { ToggleProgressDto } from './dto/toggle-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(UserProgress.name)
    private progressModel: Model<UserProgressDocument>,
    @InjectModel(Problem.name)
    private problemModel: Model<ProblemDocument>,
  ) {}

  // Fetch all progress for a user — returns a map of problemId → completed
  async getUserProgress(userId: string): Promise<Record<string, boolean>> {
    const records = await this.progressModel.find({ userId: new Types.ObjectId(userId) }).lean();
    return records.reduce(
      (acc, r) => {
        acc[r.problemId.toString()] = r.completed;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  // Upsert: one DB write regardless of whether record exists
  async toggleProgress(userId: string, dto: ToggleProgressDto): Promise<UserProgressDocument> {
    return this.progressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), problemId: new Types.ObjectId(dto.problemId) },
      { completed: dto.completed, updatedAt: new Date() },
      { upsert: true, new: true },
    );
  }

  // Aggregated stats per topic
  async getTopicStats(userId: string) {
    return this.progressModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), completed: true } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.topicId',
          completedCount: { $sum: 1 },
        },
      },
    ]);
  }

  // Overall completion stats for a user
  async getOverallStats(userId: string) {
    const uid = new Types.ObjectId(userId);
    const [total, completed] = await Promise.all([
      this.problemModel.countDocuments({}),
      this.progressModel.countDocuments({ userId: uid, completed: true }),
    ]);
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }
}
