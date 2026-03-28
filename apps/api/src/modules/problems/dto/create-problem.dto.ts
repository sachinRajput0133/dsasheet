import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsMongoId,
  IsUrl,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export class CreateProblemDto {
  @IsMongoId()
  topicId: string;

  @IsString()
  @MinLength(2)
  title: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUrl()
  @IsOptional()
  youtubeLink?: string;

  @IsUrl()
  @IsOptional()
  codingLink?: string;

  @IsUrl()
  @IsOptional()
  articleLink?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
