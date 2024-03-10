import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				FRONTEND_URL: Joi.string().required(),
				INTRA_CLIENT_ID: Joi.string().required(),
				INTRA_CLIENT_SECRET: Joi.string().required(),
				INTRA_CALLBACK_URL: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				DATABASE_URL: Joi.string().required(),
				AWS_ACCESS_ID: Joi.string().required(),
				AWS_ACCESS_SECRET: Joi.string().required(),
				AWS_S3_BUCKET: Joi.string().required(),
				AWS_S3_REGION: Joi.string().required(),
			}),
			validationOptions: {
				abortEarly: true,
			},
		}),
		AuthModule,
		UserModule,
		ChatModule,
		SocketModule,
		ThrottlerModule.forRoot([
			{
				name: 'short',
				ttl: 1000,
				limit: 20,
			},
			{
				name: 'medium',
				ttl: 10000,
				limit: 100,
			},
			{
				name: 'long',
				ttl: 60000,
				limit: 1000,
			},
		]),
		GameModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
