import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Phone number to send message to (with or without country code)',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Message content to send',
    example: 'Hello from AI Todo App!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendGroupMessageDto {
  @ApiProperty({
    description: 'Group ID to send message to',
    example: '1234567890-1234567890@g.us',
  })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    description: 'Message content to send to group',
    example: 'Hello group from AI Todo App!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class WhatsappStatusDto {
  @ApiProperty({
    description: 'Whether the WhatsApp client is ready',
    example: true,
  })
  isReady: boolean;

  @ApiProperty({
    description: 'QR code data for authentication (if not authenticated)',
    example: null,
    nullable: true,
  })
  qrCode: string | null;
}

export class ChatDto {
  @ApiProperty({
    description: 'Chat ID',
    example: '1234567890@c.us',
  })
  id: string;

  @ApiProperty({
    description: 'Chat name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Whether this is a group chat',
    example: false,
  })
  isGroup: boolean;

  @ApiProperty({
    description: 'Number of unread messages',
    example: 0,
  })
  unreadCount: number;
}

export class ContactDto {
  @ApiProperty({
    description: 'Contact ID',
    example: '1234567890@c.us',
  })
  id: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '1234567890',
  })
  number: string;

  @ApiProperty({
    description: 'Whether this contact is in your contacts list',
    example: true,
  })
  isMyContact: boolean;
}