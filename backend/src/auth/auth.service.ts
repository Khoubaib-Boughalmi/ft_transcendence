import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Profile } from 'passport-42';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) { }

    async validateUser(profile: Profile): Promise<any> {
        const user = await this.userService.user({ intra_id: Number(profile.id) });
        if (user)
            return { id: user.id };
        const newName = await this.userService.getUniqueName(profile.username);
        const newUser = await this.userService.createUser({
            username: newName,
            intra_id: Number(profile.id),
            email: profile.emails[0].value,
            country: profile._json.campus[0].country,
        });
        return { id: newUser.id, two_factor_passed: true };
    }

    async validateJwt(jwtPayload: any, two_factor_verify: boolean): Promise<any> {
        const user = await this.userService.user({ id: jwtPayload.id });
        if (!user) return null;
        if (two_factor_verify && user.two_factor && !jwtPayload.two_factor_passed) return null;
        return { id: user.id, two_factor_passed: jwtPayload.two_factor_passed };
    }

    async login(user: User) {
        const payload = { id: user.id, two_factor_passed: user.two_factor ? false : true };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async login2fa(user: User) {
        const payload = { id: user.id, two_factor_passed: true };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async verifyJWTforSocket(token: string): Promise<any> {
        try {
            const payload = this.jwtService.verify(token);
            return { id: payload['id'], two_factor_passed: payload['two_factor_passed'] };
        } catch (err) {
            return null;
        }
    }
}
