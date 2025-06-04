import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateWhatsAppDto {
  @ApiProperty({ 
    description: 'WhatsApp phone number with country code', 
    example: '+628125999849',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'WhatsApp number must be a valid phone number with country code'
  })
  whatsappNumber?: string;
}