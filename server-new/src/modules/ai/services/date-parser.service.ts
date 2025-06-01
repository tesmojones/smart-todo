import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

interface DatePattern {
  pattern: RegExp;
  offset: number;
  unit?: 'days' | 'weeks' | 'months';
}

@Injectable()
export class DateParserService {
  private readonly datePatterns: DatePattern[] = [
    { pattern: /\btomorrow\b/i, offset: 1, unit: 'days' },
    { pattern: /\btoday\b/i, offset: 0, unit: 'days' },
    { pattern: /\bnext week\b/i, offset: 1, unit: 'weeks' },
    { pattern: /\bthis weekend\b/i, offset: 5, unit: 'days' },
    { pattern: /\bmonday\b/i, offset: 1, unit: 'days' },
    { pattern: /\btuesday\b/i, offset: 2, unit: 'days' },
    { pattern: /\bwednesday\b/i, offset: 3, unit: 'days' },
    { pattern: /\bthursday\b/i, offset: 4, unit: 'days' },
    { pattern: /\bfriday\b/i, offset: 5, unit: 'days' },
    { pattern: /\bsaturday\b/i, offset: 6, unit: 'days' },
    { pattern: /\bsunday\b/i, offset: 7, unit: 'days' },
    { pattern: /\bnext month\b/i, offset: 1, unit: 'months' },
  ];

  parseDate(text: string): Date | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Check for relative date patterns
    for (const { pattern, offset, unit } of this.datePatterns) {
      if (pattern.test(text)) {
        return moment().add(offset, unit || 'days').toDate();
      }
    }

    // Try to parse specific time formats
    const timeMatch = text.match(/(\d{1,2})\s*(pm|am)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const isPM = timeMatch[2].toLowerCase() === 'pm';
      const adjustedHour = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
      return moment().hour(adjustedHour).minute(0).second(0).millisecond(0).toDate();
    }

    // Try to parse absolute dates
    const absoluteDate = moment(text, [
      'YYYY-MM-DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'MMMM DD, YYYY',
      'DD MMMM YYYY',
    ], true);

    if (absoluteDate.isValid()) {
      return absoluteDate.toDate();
    }

    return null;
  }

  removeDateReferences(text: string): string {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let cleanedText = text;

    // Remove common date phrases
    const datePhrasesToRemove = [
      /\b(tomorrow|today|next week|this weekend)\b/gi,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      /\b\d{1,2}\s*(pm|am)\b/gi,
      /\b(next month|next year)\b/gi,
    ];

    datePhrasesToRemove.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    // Clean up extra whitespace
    return cleanedText.replace(/\s+/g, ' ').trim();
  }
}