import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoiceInputDto {
  @ApiProperty({ description: 'Voice transcript text' })
  @IsString()
  @IsNotEmpty()
  transcript: string;
}