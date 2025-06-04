import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto, SendGroupMessageDto } from './dto/whatsapp.dto';

@ApiTags('whatsapp')
@Controller('api/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get WhatsApp client status' })
  @ApiResponse({ status: 200, description: 'Returns client status and QR code if needed' })
  getStatus() {
    try {
      return this.whatsappService.getStatus();
    } catch (error) {
      this.logger.error('Failed to get status:', error);
      throw new HttpException(
        'Failed to get WhatsApp status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-message')
  @ApiOperation({ summary: 'Send a message to a contact' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Failed to send message' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      const { to, message } = sendMessageDto;
      
      if (!to || !message) {
        throw new HttpException(
          'Phone number and message are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.whatsappService.sendMessage(to, message);
      
      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          to,
          message,
          messageId: result.id._serialized,
          timestamp: result.timestamp,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      
      if (error.message === 'WhatsApp client is not ready') {
        throw new HttpException(
          'WhatsApp client is not ready. Please scan QR code first.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-group-message')
  @ApiOperation({ summary: 'Send a message to a group' })
  @ApiBody({ type: SendGroupMessageDto })
  @ApiResponse({ status: 200, description: 'Group message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Failed to send group message' })
  async sendGroupMessage(@Body() sendGroupMessageDto: SendGroupMessageDto) {
    try {
      const { groupId, message } = sendGroupMessageDto;
      
      if (!groupId || !message) {
        throw new HttpException(
          'Group ID and message are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.whatsappService.sendMessageToGroup(groupId, message);
      
      return {
        success: true,
        message: 'Group message sent successfully',
        data: {
          groupId,
          message,
          messageId: result.id._serialized,
          timestamp: result.timestamp,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send group message:', error);
      
      if (error.message === 'WhatsApp client is not ready') {
        throw new HttpException(
          'WhatsApp client is not ready. Please scan QR code first.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'Failed to send group message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all chats' })
  @ApiResponse({ status: 200, description: 'Returns list of chats' })
  @ApiResponse({ status: 500, description: 'Failed to get chats' })
  async getChats() {
    try {
      const chats = await this.whatsappService.getChats();
      
      return {
        success: true,
        data: chats,
      };
    } catch (error) {
      this.logger.error('Failed to get chats:', error);
      
      if (error.message === 'WhatsApp client is not ready') {
        throw new HttpException(
          'WhatsApp client is not ready. Please scan QR code first.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'Failed to get chats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, description: 'Returns list of contacts' })
  @ApiResponse({ status: 500, description: 'Failed to get contacts' })
  async getContacts() {
    try {
      const contacts = await this.whatsappService.getContacts();
      
      return {
        success: true,
        data: contacts,
      };
    } catch (error) {
      this.logger.error('Failed to get contacts:', error);
      
      if (error.message === 'WhatsApp client is not ready') {
        throw new HttpException(
          'WhatsApp client is not ready. Please scan QR code first.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'Failed to get contacts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      service: 'whatsapp',
      timestamp: new Date().toISOString(),
    };
  }
}