import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService],
  imports: [NestjsFormDataModule],
})
export class ChatModule {}
