import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from '../../common/dto/create-task.dto';
import { UpdateTaskDto } from '../../common/dto/update-task.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from '../ai/ai.service';
import { Task } from '../../database/entities/task.entity';
import { IRecommendation, ITaskData } from '../../common/interfaces/task.interface';

@ApiTags('Tasks')
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async findAll(@CurrentUser('id') userId: string): Promise<Task[]> {
    return this.tasksService.findAll(userId);
  }



  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered task recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations generated successfully' })
  async getRecommendations(
    @CurrentUser('id') userId: string,
    @Query('completionRate') completionRate?: number,
    @Query('overdueCount') overdueCount?: number,
    @Query('totalTasks') totalTasks?: number,
  ): Promise<IRecommendation[]> {
    const userPatterns = {
      completionRate: completionRate ?? 0,
      overdueCount: overdueCount ?? 0,
      totalTasks: totalTasks ?? 0,
      tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      peakHours: [], // Could be calculated from task creation/completion times
      commonTags: [], // Could be extracted from user's tasks
    };

    return this.aiService.generateRecommendations(userPatterns);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task (PUT method)' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updatePut(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.tasksService.remove(id, userId);
    return { message: 'Task deleted successfully' };
  }
}