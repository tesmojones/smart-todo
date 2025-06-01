import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DateParserService } from './services/date-parser.service';
import { OpenAiService } from './services/openai.service';
import { NaturalLanguageService } from './services/natural-language.service';
import { RecommendationService } from './services/recommendation.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    DateParserService,
    OpenAiService,
    NaturalLanguageService,
    RecommendationService,
  ],
  exports: [AiService],
})
export class AiModule {}