import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService], // Export service so other modules can use it
})
export class WhatsappModule {}