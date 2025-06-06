import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../interfaces/task.interface';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Task title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Task due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Task priority', enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Task status', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Task tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Task position for ordering' })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ description: 'Is task repetitive' })
  @IsOptional()
  @IsBoolean()
  isRepetitive?: boolean;

  @ApiPropertyOptional({ description: 'Task type (once or repeatedly)' })
  @IsOptional()
  @IsString()
  taskType?: string;

  @ApiPropertyOptional({ description: 'Task creation date' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiPropertyOptional({ description: 'Number of completed Pomodoro sessions' })
  @IsOptional()
  @IsNumber()
  pomodoroCount?: number;
}