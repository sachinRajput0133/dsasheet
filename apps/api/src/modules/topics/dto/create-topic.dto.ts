import { IsString, IsOptional, IsNumber, MinLength, Min } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
