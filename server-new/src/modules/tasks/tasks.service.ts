import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../database/entities/task.entity';
import { User } from '../../database/entities/user.entity';
import { CreateTaskDto } from '../../common/dto/create-task.dto';
import { UpdateTaskDto } from '../../common/dto/update-task.dto';
import { AiService } from '../ai/ai.service';
import { ITaskAnalytics, TaskStatus, TaskPriority } from '../../common/interfaces/task.interface';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly aiService: AiService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    this.logger.log(`Creating task for user ${userId}`);

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let taskData;
    let inputText: string;
    
    // Extract input text from string input or direct text
    if (createTaskDto.input) {
      inputText = createTaskDto.input;
    } else if (createTaskDto.text) {
      inputText = createTaskDto.text;
    }
    
    // Process natural language input if provided
    if (inputText) {
      taskData = await this.aiService.parseTaskInput(inputText);
    }

    // Use tags from DTO (client-side parsed) or AI service
    const allTags = [...(taskData?.tags || []), ...(createTaskDto.tags || [])];
    const uniqueTags = [...new Set(allTags)];

    // Create task with processed or direct data
    const task = this.taskRepository.create({
      title: taskData?.title || createTaskDto.title || inputText,
      dueDate: taskData?.dueDate || createTaskDto.dueDate,
      priority: taskData?.priority || createTaskDto.priority || TaskPriority.MEDIUM,
      tags: uniqueTags,
      status: TaskStatus.NOT_STARTED,
      isRepetitive: createTaskDto.isRepetitive || false,
      position: await this.getNextPosition(userId),
      createdAt: createTaskDto.createdAt ? new Date(createTaskDto.createdAt) : undefined,
      user,
    });

    const savedTask = await this.taskRepository.save(task);
    this.logger.log(`Task created with ID: ${savedTask.id}`);
    
    return savedTask;
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user: { id: userId } },
      order: { position: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // No additional status synchronization needed

    // Extract hashtags from title if updated
    if (updateTaskDto.title) {
      const hashtags = this.extractHashtags(updateTaskDto.title);
      if (hashtags.length > 0) {
        updateTaskDto.tags = [...(updateTaskDto.tags || task.tags || []), ...hashtags];
        updateTaskDto.tags = [...new Set(updateTaskDto.tags)]; // Remove duplicates
      }
    }

    // Handle position updates for reordering
    if (updateTaskDto.position !== undefined && updateTaskDto.position !== task.position) {
      await this.reorderTasks(userId, task.position, updateTaskDto.position);
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
    this.logger.log(`Task ${id} deleted`);
  }

  async getAnalytics(userId: string): Promise<ITaskAnalytics> {
    const tasks = await this.findAll(userId);
    const now = new Date();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueCount = tasks.filter(task => 
      task.dueDate && task.dueDate < now && task.status !== TaskStatus.COMPLETED
    ).length;

    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    const tasksByPriority = {
      low: tasks.filter(task => task.priority === TaskPriority.LOW).length,
      medium: tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
      high: tasks.filter(task => task.priority === TaskPriority.HIGH).length,
      urgent: tasks.filter(task => task.priority === TaskPriority.URGENT).length,
    };

    const tasksByStatus = {
      not_started: tasks.filter(task => task.status === TaskStatus.NOT_STARTED).length,
      in_progress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
    };

    // Average completion time calculation removed since completedAt field was removed

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueCount,
      completionRate,
      tasksByPriority,
      tasksByStatus,
    };
  }

  private async getNextPosition(userId: string): Promise<number> {
    const lastTask = await this.taskRepository.findOne({
      where: { user: { id: userId } },
      order: { position: 'DESC' },
    });

    return lastTask ? lastTask.position + 1 : 0;
  }

  private async reorderTasks(userId: string, oldPosition: number, newPosition: number): Promise<void> {
    if (oldPosition === newPosition) return;

    const tasks = await this.taskRepository.find({
      where: { user: { id: userId } },
      order: { position: 'ASC' },
    });

    // Update positions for all tasks to ensure proper ordering
    const sortedTasks = tasks.sort((a, b) => a.position - b.position);
    
    for (let i = 0; i < sortedTasks.length; i++) {
      if (sortedTasks[i].position !== i) {
        sortedTasks[i].position = i;
        await this.taskRepository.save(sortedTasks[i]);
      }
    }
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const hashtags: string[] = [];
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }

    return hashtags;
  }
}