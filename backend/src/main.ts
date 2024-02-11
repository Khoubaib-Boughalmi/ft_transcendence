import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplicationContext, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class PregoSocketAdapter extends IoAdapter {
	constructor(private app: INestApplicationContext) {
		super(app);
	}

	createIOServer(port: number, options?: ServerOptions): any {
		const server = super.createIOServer(port, {
			...options,
			cors: {
				origin: process.env.FRONTEND_URL,
				credentials: true,
			},
		});
		return server;
	}
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('/api');
	app.useWebSocketAdapter(new PregoSocketAdapter(app));
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
