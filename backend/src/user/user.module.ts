import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AppService } from 'src/app.service';
import { AuthService } from 'src/auth/auth.service';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaService } from 'src/prisma.service';
import { SocketModule } from 'src/socket/socket.module';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
	providers: [
		UserService,
		PrismaService,
		AppService,
		UserGateway,
		AuthService,
	],
	controllers: [UserController],
	exports: [UserService, UserGateway],
	imports: [
		SocketModule,
		ChatModule,
		NestjsFormDataModule,
		JwtModule.registerAsync({
			useFactory: () => ({
				secret: process.env.JWT_SECRET,
				signOptions: { expiresIn: '10h' },
			}),
		}),
	],
})
export class UserModule {}
