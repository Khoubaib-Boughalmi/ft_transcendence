import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { IntraStrategy } from './auth.strategies';
import { AuthSerializer } from './auth.serializer';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, IntraStrategy, AuthSerializer],
})
export class AuthModule { }
