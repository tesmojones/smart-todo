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

export interface ITaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueCount: number;
  completionRate: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasksByStatus: {
    not_started: number;
    in_progress: number;
    completed: number;
  };
  productivityTrends?: {
    date: string;
    completed: number;
    created: number;
  }[];
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