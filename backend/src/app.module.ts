import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import * as Joi from 'joi';

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
			}),
			validationOptions: {
				abortEarly: true,
			},
		}),
		AuthModule,
		UserModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
