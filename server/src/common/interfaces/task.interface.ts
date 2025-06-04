export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface ITaskData {
  title: string;
  dueDate?: Date;
  priority: TaskPriority;
  tags?: string[];
  createdAt?: Date;
  status?: TaskStatus;
  isRepetitive?: boolean;
}

export interface IUserPatterns {
  completionRate: number;
  overdueCount: number;
  totalTasks: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  peakHours: number[];
  commonTags: string[];
}

export interface IRecommendation {
  type: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
}