import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, UserService],
  imports: [NestjsFormDataModule],
})
export class ChatModule {}
