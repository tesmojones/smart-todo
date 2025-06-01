import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VoiceInputDto } from '../../common/dto/voice-input.dto';
import { ITaskData, IRecommendation } from '../../common/interfaces/task.interface';

@ApiTags('AI')
@Controller('api/ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-task')
  @ApiOperation({ summary: 'Parse natural language input into structured task data' })
  @ApiResponse({ status: 200, description: 'Task data parsed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async parseTask(@Body('input') input: string): Promise<ITaskData> {
    return this.aiService.parseTaskInput(input);
  }

  @Post('voice-to-task')
  @ApiOperation({ summary: 'Convert voice transcript to task data' })
  @ApiResponse({ status: 200, description: 'Voice input processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid voice input' })
  async voiceToTask(@Body() voiceInputDto: VoiceInputDto): Promise<ITaskData> {
    return this.aiService.processVoiceInput(voiceInputDto.transcript);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered task recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations generated successfully' })
  async getRecommendations(
    @Query('completionRate') completionRate?: number,
    @Query('overdueCount') overdueCount?: number,
    @Query('totalTasks') totalTasks?: number,
  ): Promise<IRecommendation[]> {
    const userPatterns = {
      completionRate: completionRate || 0.8,
      overdueCount: overdueCount || 0,
      totalTasks: totalTasks || 0,
      tasksByPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      },
      peakHours: [],
      commonTags: [],
    };

    return this.aiService.generateRecommendations(userPatterns);
  }
}