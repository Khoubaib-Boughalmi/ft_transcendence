import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
            avatar: profile._json.image.link,
            banner: '/background2.png',
        });
        return { id: newUser.id };
    }

    async validateJwt(jwtPayload: any): Promise<any> {
        const user = await this.userService.user({ id: jwtPayload.id });
        if (!user) return null;
        return { id: user.id };
    }

    async login(user: any) {
        const payload = { id: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
