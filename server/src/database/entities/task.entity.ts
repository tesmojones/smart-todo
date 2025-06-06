import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { TaskPriority, TaskStatus } from '../../common/interfaces/task.interface';

@Entity('tasks')
export class Task {
  @ApiProperty({ description: 'Task unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Task title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Task due date', required: false })
  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @ApiProperty({ description: 'Task priority', enum: TaskPriority })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty({ description: 'Task status', enum: TaskStatus })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NOT_STARTED,
  })
  status: TaskStatus;

  @ApiProperty({ description: 'Task tags', type: [String] })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: 'Task creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Task last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Is task repetitive' })
  @Column({ name: 'is_repetitive', default: false })
  isRepetitive: boolean;

  @ApiProperty({ description: 'Task position for ordering' })
  @Column({ default: 0 })
  position: number;

  @ApiProperty({ description: 'Number of completed Pomodoro sessions' })
  @Column({ name: 'pomodoro_count', default: 0 })
  pomodoroCount: number;

  @ApiProperty({ description: 'User ID who owns this task' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}