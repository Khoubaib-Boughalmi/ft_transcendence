import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { AppService } from 'src/app.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
	providers: [UserService, PrismaService, AppService],
	controllers: [UserController],
	exports: [UserService],
	imports: [NestjsFormDataModule],
})
export class UserModule {}
