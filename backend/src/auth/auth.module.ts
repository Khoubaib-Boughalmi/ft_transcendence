import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { IntraStrategy } from './auth.strategies';
import { AuthSerializer } from './auth.serializer';
import { AuthService } from './auth.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService, IntraStrategy, AuthSerializer],
})
export class AuthModule { }
