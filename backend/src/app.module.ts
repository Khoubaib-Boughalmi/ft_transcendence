import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({ isGlobal: true }),
	],
	controllers: [AppController, AuthController],
	providers: [AppService, AuthService],
})
export class AppModule { }
