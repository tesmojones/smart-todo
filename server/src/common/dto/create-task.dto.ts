import { IsString, IsOptional, IsDateString, IsEnum, IsArray, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskPriority } from '../interfaces/task.interface';

class TaskInputDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  aiEnhancements?: string;

  @IsOptional()
  @IsString()
  taskType?: string;
}

export class CreateTaskDto {
  @ApiPropertyOptional({ description: 'Task title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Natural language input for AI processing' })
  @IsOptional()
  @IsString()
  input?: string;

  @ApiPropertyOptional({ description: 'Direct text input' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Task due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Task priority', enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Task tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Task type (once or repeatedly)' })
  @IsOptional()
  @IsString()
  taskType?: string;

  @ApiPropertyOptional({ description: 'Is task repetitive' })
  @IsOptional()
  @IsBoolean()
  isRepetitive?: boolean;

  @ApiPropertyOptional({ description: 'Task creation date' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiPropertyOptional({ description: 'AI enhancements for the task' })
  @IsOptional()
  @IsString()
  aiEnhancements?: string;
}