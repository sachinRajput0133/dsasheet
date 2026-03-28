import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { Problem, ProblemDocument } from './schemas/problem.schema';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { QueryProblemsDto } from './dto/query-problems.dto';

@Injectable()
export class ProblemsService {
  constructor(@InjectModel(Problem.name) private problemModel: Model<ProblemDocument>) {}

  async findAll(query: QueryProblemsDto) {
    const { topicId, difficulty, search, page = 1, limit = 50 } = query;
    const filter: FilterQuery<ProblemDocument> = {};

    if (topicId) filter.topicId = new Types.ObjectId(topicId);
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
      this.problemModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit).exec(),
      this.problemModel.countDocuments(filter),
    ]);

    return { problems, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ProblemDocument> {
    const problem = await this.problemModel.findById(id).exec();
    if (!problem) throw new NotFoundException(`Problem ${id} not found`);
    return problem;
  }

  async findByTopicId(topicId: string): Promise<ProblemDocument[]> {
    return this.problemModel.find({ topicId }).sort({ order: 1 }).exec();
  }

  async create(dto: CreateProblemDto): Promise<ProblemDocument> {
    return this.problemModel.create(dto);
  }

  async update(id: string, dto: UpdateProblemDto): Promise<ProblemDocument> {
    const problem = await this.problemModel.findByIdAndUpdate(id, dto, { new: true });
    if (!problem) throw new NotFoundException(`Problem ${id} not found`);
    return problem;
  }

  async remove(id: string): Promise<void> {
    const result = await this.problemModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Problem ${id} not found`);
  }

  async countByTopic(topicId: string): Promise<number> {
    return this.problemModel.countDocuments({ topicId });
  }
}
