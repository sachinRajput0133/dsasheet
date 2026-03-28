import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(@InjectModel(Topic.name) private topicModel: Model<TopicDocument>) {}

  async findAll(): Promise<TopicDocument[]> {
    return this.topicModel.find().sort({ order: 1 }).exec();
  }

  async findById(id: string): Promise<TopicDocument> {
    const topic = await this.topicModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic ${id} not found`);
    return topic;
  }

  async create(dto: CreateTopicDto): Promise<TopicDocument> {
    return this.topicModel.create(dto);
  }

  async update(id: string, dto: UpdateTopicDto): Promise<TopicDocument> {
    const topic = await this.topicModel.findByIdAndUpdate(id, dto, { new: true });
    if (!topic) throw new NotFoundException(`Topic ${id} not found`);
    return topic;
  }

  async remove(id: string): Promise<void> {
    const result = await this.topicModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Topic ${id} not found`);
  }
}
