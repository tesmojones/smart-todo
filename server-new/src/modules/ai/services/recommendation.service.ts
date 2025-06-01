import { Injectable, Logger } from '@nestjs/common';
import { IRecommendation, IUserPatterns, TaskPriority } from '../../../common/interfaces/task.interface';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  generateRecommendations(userPatterns: IUserPatterns): IRecommendation[] {
    this.logger.log('Generating recommendations based on user patterns');

    const recommendations: IRecommendation[] = [];

    // Analyze completion patterns
    if (userPatterns.completionRate < 0.7) {
      recommendations.push({
        type: 'productivity',
        title: 'Break down large tasks',
        description: 'Consider breaking your tasks into smaller, more manageable pieces to improve completion rates.',
        priority: TaskPriority.MEDIUM,
        category: 'productivity',
      });
    }

    // Analyze overdue patterns
    if (userPatterns.overdueCount > 3) {
      recommendations.push({
        type: 'time_management',
        title: 'Review your deadlines',
        description: 'You have several overdue tasks. Consider reviewing your time estimates and setting more realistic deadlines.',
        priority: TaskPriority.HIGH,
        category: 'time_management',
      });
    }

    // Analyze task distribution
    if (userPatterns.tasksByPriority?.urgent > userPatterns.tasksByPriority?.high) {
      recommendations.push({
        type: 'planning',
        title: 'Better task prioritization',
        description: 'You have many urgent tasks. Try to plan ahead and set priorities earlier to avoid last-minute rushes.',
        priority: TaskPriority.MEDIUM,
        category: 'planning',
      });
    }

    // Analyze peak productivity times
    if (userPatterns.peakHours && userPatterns.peakHours.length > 0) {
      const peakTime = userPatterns.peakHours[0];
      recommendations.push({
        type: 'scheduling',
        title: 'Optimize your schedule',
        description: `You're most productive around ${peakTime}:00. Consider scheduling important tasks during this time.`,
        priority: TaskPriority.LOW,
        category: 'scheduling',
      });
    }

    // Analyze tag patterns
    if (userPatterns.commonTags && userPatterns.commonTags.length > 0) {
      const topTag = userPatterns.commonTags[0];
      recommendations.push({
        type: 'organization',
        title: 'Task categorization',
        description: `You frequently work on '${topTag}' tasks. Consider creating a dedicated workflow for these tasks.`,
        priority: TaskPriority.LOW,
        category: 'organization',
      });
    }

    // Weekly planning recommendation
    recommendations.push({
      type: 'planning',
      title: 'Weekly planning session',
      description: 'Set aside 30 minutes each week to review completed tasks and plan for the upcoming week.',
      priority: TaskPriority.MEDIUM,
      category: 'planning',
    });

    // Daily review recommendation
    if (userPatterns.totalTasks > 10) {
      recommendations.push({
        type: 'review',
        title: 'Daily task review',
        description: 'Spend 5 minutes each evening reviewing your progress and preparing for tomorrow.',
        priority: TaskPriority.LOW,
        category: 'review',
      });
    }

    this.logger.debug(`Generated ${recommendations.length} recommendations`);
    return recommendations;
  }

  private getTimeBasedRecommendations(): IRecommendation[] {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const recommendations: IRecommendation[] = [];

    // Morning recommendations
    if (hour >= 6 && hour <= 10) {
      recommendations.push({
        type: 'scheduling',
        title: 'Morning planning',
        description: 'Start your day by reviewing your task list and setting priorities for today.',
        priority: TaskPriority.MEDIUM,
        category: 'planning',
      });
    }

    // End of week recommendations
    if (dayOfWeek === 5) { // Friday
      recommendations.push({
        type: 'review',
        title: 'Weekly wrap-up',
        description: 'Take time to review this week\'s accomplishments and plan for next week.',
        priority: TaskPriority.LOW,
        category: 'review',
      });
    }

    // Weekend recommendations
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      recommendations.push({
        type: 'planning',
        title: 'Weekend planning',
        description: 'Use the weekend to plan personal tasks and prepare for the upcoming week.',
        priority: TaskPriority.LOW,
        category: 'planning',
      });
    }

    return recommendations;
  }
}