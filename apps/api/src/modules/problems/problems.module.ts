import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Problem, ProblemSchema } from './schemas/problem.schema';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }])],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
