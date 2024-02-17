import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AppService } from 'src/app.service';
import { SocketModule } from 'src/socket/socket.module';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [ChatController],
	providers: [ChatService, PrismaService, AppService],
	imports: [NestjsFormDataModule, SocketModule, forwardRef(() => UserModule)],
	exports: [ChatService],
})
export class ChatModule {}
