import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ITaskData, TaskPriority } from '../../../common/interfaces/task.interface';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI service initialized');
    } else {
      this.openai = null;
      this.logger.warn('OpenAI API key not configured');
    }
  }

  isConfigured(): boolean {
    return this.openai !== null;
  }

  async parseTask(input: string): Promise<ITaskData> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const prompt = `Parse this task input and extract structured information. Return a JSON object with these fields:
- title: Clean task title (remove date/time references)
- priority: one of "low", "medium", "high", "urgent"
- dueDate: YYYY-MM-DD format date string if mentioned (e.g., if "tomorrow" then tomorrow's date), null otherwise

Input: "${input}"

Current date/time: ${new Date().toISOString()}

Return only valid JSON:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      });

      const rawContent = response.choices[0].message.content?.trim();
      if (!rawContent) {
        throw new Error('Empty response from OpenAI');
      }

      this.logger.debug('OpenAI raw response:', rawContent);

      const result = JSON.parse(rawContent);
      this.logger.debug('Parsed OpenAI result:', result);

      // Validate and clean the result
      const taskData: ITaskData = {
        title: result.title || input,
        dueDate: result.dueDate ? new Date(result.dueDate) : undefined,
        priority: this.validatePriority(result.priority),

      };

      return taskData;
    } catch (error) {
      this.logger.error('OpenAI parsing failed:', error.message);
      throw error;
    }
  }

  private validatePriority(priority: string): TaskPriority {
    const validPriorities = Object.values(TaskPriority);
    return validPriorities.includes(priority as TaskPriority) 
      ? (priority as TaskPriority) 
      : TaskPriority.MEDIUM;
  }
}