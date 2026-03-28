import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ToggleProgressDto } from './dto/toggle-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get()
  getProgress(@CurrentUser() user: JwtPayload) {
    return this.progressService.getUserProgress(user.sub);
  }

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.progressService.getOverallStats(user.sub);
  }

  @Get('topic-stats')
  getTopicStats(@CurrentUser() user: JwtPayload) {
    return this.progressService.getTopicStats(user.sub);
  }

  @Post('toggle')
  toggle(@CurrentUser() user: JwtPayload, @Body() dto: ToggleProgressDto) {
    return this.progressService.toggleProgress(user.sub, dto);
  }
}
