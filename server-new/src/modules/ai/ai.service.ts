import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from './services/openai.service';
import { NaturalLanguageService } from './services/natural-language.service';
import { RecommendationService } from './services/recommendation.service';
import { ITaskData, IRecommendation, IUserPatterns } from '../../common/interfaces/task.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly naturalLanguageService: NaturalLanguageService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async parseTaskInput(input: string): Promise<ITaskData> {
    this.logger.log(`Processing task input: ${input}`);

    try {
      // Try OpenAI first if available
      if (this.openAiService.isConfigured()) {
        this.logger.log('Using OpenAI for task parsing');
        return await this.openAiService.parseTask(input);
      }
    } catch (error) {
      this.logger.warn('OpenAI parsing failed, falling back to natural language processing', error.message);
    }

    // Fallback to natural language processing
    this.logger.log('Using natural language processing for task parsing');
    return this.naturalLanguageService.parseTask(input);
  }

  async generateRecommendations(userPatterns: IUserPatterns): Promise<IRecommendation[]> {
    this.logger.log('Generating task recommendations');
    return this.recommendationService.generateRecommendations(userPatterns);
  }

  processVoiceInput(transcript: string): ITaskData {
    this.logger.log(`Processing voice input: ${transcript}`);
    return this.naturalLanguageService.parseTask(transcript);
  }
}