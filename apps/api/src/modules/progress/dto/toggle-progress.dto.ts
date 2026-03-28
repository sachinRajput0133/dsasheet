import { IsMongoId, IsBoolean } from 'class-validator';

export class ToggleProgressDto {
  @IsMongoId()
  problemId: string;

  @IsBoolean()
  completed: boolean;
}
