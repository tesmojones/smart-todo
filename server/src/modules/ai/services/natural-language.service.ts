import { Injectable, Logger } from '@nestjs/common';
import { DateParserService } from './date-parser.service';
import { ITaskData, TaskPriority } from '../../../common/interfaces/task.interface';

@Injectable()
export class NaturalLanguageService {
  private readonly logger = new Logger(NaturalLanguageService.name);

  constructor(private readonly dateParserService: DateParserService) {}

  parseTask(input: string): ITaskData {
    this.logger.log(`Parsing task with natural language: ${input}`);

    const dueDate = this.dateParserService.parseDate(input);
    const title = this.dateParserService.removeDateReferences(input);
    const priority = this.extractPriority(input);
    const tags = this.extractTags(input);

    const taskData: ITaskData = {
      title: title || input,
      dueDate,
      priority,
      tags,
      createdAt: new Date(),
    };

    this.logger.debug('Parsed task data:', taskData);
    return taskData;
  }

  private extractPriority(text: string): TaskPriority {
    const lowercaseText = text.toLowerCase();

    if (lowercaseText.includes('urgent') || lowercaseText.includes('asap') || lowercaseText.includes('emergency')) {
      return TaskPriority.URGENT;
    }

    if (lowercaseText.includes('high priority') || lowercaseText.includes('important') || lowercaseText.includes('critical')) {
      return TaskPriority.HIGH;
    }

    if (lowercaseText.includes('low priority') || lowercaseText.includes('when possible') || lowercaseText.includes('sometime')) {
      return TaskPriority.LOW;
    }

    return TaskPriority.MEDIUM;
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowercaseText = text.toLowerCase();

    // Extract hashtags
    const hashtagMatches = text.match(/#\w+/g);
    if (hashtagMatches) {
      tags.push(...hashtagMatches.map(tag => tag.substring(1)));
    }

    // Extract category-based tags
    const categoryMappings = {
      work: ['work', 'office', 'meeting', 'project', 'deadline', 'presentation', 'email'],
      personal: ['personal', 'home', 'family', 'friend', 'birthday', 'anniversary'],
      health: ['doctor', 'appointment', 'gym', 'exercise', 'medication', 'health'],
      shopping: ['buy', 'purchase', 'shop', 'store', 'grocery', 'groceries'],
      finance: ['pay', 'bill', 'bank', 'money', 'budget', 'tax', 'invoice'],
      travel: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'booking'],
      education: ['study', 'learn', 'course', 'class', 'homework', 'assignment'],
    };

    Object.entries(categoryMappings).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        tags.push(category);
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }
}