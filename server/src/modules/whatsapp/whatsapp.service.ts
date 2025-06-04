import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client;
  private isReady = false;
  private qrCodeData: string | null = null;

  async onModuleInit() {
    await this.initializeClient();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.destroy();
    }
  }

  private async initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'nestjs-whatsapp-client',
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
    });

    this.client.on('qr', (qr) => {
      this.logger.log('QR Code received, scan with your phone:');
      qrcode.generate(qr, { small: true });
      this.qrCodeData = qr;
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp Client is ready!');
      this.isReady = true;
      this.qrCodeData = null;
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp Client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error('Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      this.logger.warn('WhatsApp Client disconnected:', reason);
      this.isReady = false;
    });

    this.client.on('message', async (message: Message) => {
      this.logger.log(`Received message: ${message.body} from ${message.from}`);
    });

    try {
      await this.client.initialize();
      this.logger.log('WhatsApp client initialization started');
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp client:', error);
    }
  }

  async sendMessage(to: string, message: string): Promise<any> {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      // Format phone number (ensure it includes country code)
      const formattedNumber = this.formatPhoneNumber(to);
      const chatId = `${formattedNumber}@c.us`;
      
      const result = await this.client.sendMessage(chatId, message);
      this.logger.log(`Message sent to ${to}: ${message}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  async sendMessageToGroup(groupId: string, message: string): Promise<any> {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const result = await this.client.sendMessage(groupId, message);
      this.logger.log(`Message sent to group ${groupId}: ${message}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to group ${groupId}:`, error);
      throw error;
    }
  }

  async getChats(): Promise<any[]> {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const chats = await this.client.getChats();
      return chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
      }));
    } catch (error) {
      this.logger.error('Failed to get chats:', error);
      throw error;
    }
  }

  async getContacts(): Promise<any[]> {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const contacts = await this.client.getContacts();
      return contacts.map(contact => ({
        id: contact.id._serialized,
        name: contact.name || contact.pushname,
        number: contact.number,
        isMyContact: contact.isMyContact,
      }));
    } catch (error) {
      this.logger.error('Failed to get contacts:', error);
      throw error;
    }
  }

  getStatus(): { isReady: boolean; qrCode: string | null } {
    return {
      isReady: this.isReady,
      qrCode: this.qrCodeData,
    };
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume it's a local number
    // You might want to adjust this based on your use case
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned; // Add US country code as default
    }
    
    return cleaned;
  }
}