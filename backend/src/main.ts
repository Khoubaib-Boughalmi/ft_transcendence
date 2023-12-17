import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('/api');
	app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
	app.useGlobalPipes(new ValidationPipe({
		forbidNonWhitelisted: true,
		transform: true,
		whitelist: true,
	}));
	app.use(cookieParser());
	await app.listen(3000);
}
bootstrap();
