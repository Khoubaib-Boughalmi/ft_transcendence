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
        console.log(profile);
        const user = await this.userService.user({ intra_id: Number(profile.id) });
        if (user)
            return { id: user.id, username: user.username };
        const newName = await this.userService.getUniqueName(profile.username);
        const newUser = await this.userService.createUser({
            username: newName,
            intra_id: Number(profile.id),
            email: profile.emails[0].value,
            country: profile._json.campus[0].country,
        });
        return { id: newUser.id, username: newUser.username };
    }

    async login(user: any) {
        const payload = { id: user.id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
