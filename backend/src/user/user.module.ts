import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { AppService } from 'src/app.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UserGateway } from './user.gateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
	providers: [
		UserService,
		PrismaService,
		AppService,
		UserGateway,
		AuthService,
	],
	controllers: [UserController],
	exports: [UserService],
	imports: [
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
