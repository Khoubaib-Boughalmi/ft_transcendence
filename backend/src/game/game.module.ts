import { Module, forwardRef } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from 'src/prisma.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { SocketModule } from 'src/socket/socket.module';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [GameController],
	imports: [NestjsFormDataModule, SocketModule, forwardRef(() => UserModule)],
	providers: [GameService, PrismaService],
	exports: [GameService],
})
export class GameModule {}
