import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { IntraStrategy, JwtStrategy } from './auth.strategies';
import { AuthSerializer } from './auth.serializer';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '10h' },
            }),
        }),
        NestjsFormDataModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, IntraStrategy, JwtStrategy, AuthSerializer],
})
export class AuthModule { }
