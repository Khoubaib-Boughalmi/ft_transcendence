import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-42';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async validateUser(profile: Profile): Promise<any> {
        console.log(profile);
        // Here the user should be created if it's not existent in the database otherwise it should be fetched from the database
        // then generate a JWT token and return it
        return { id: profile.id, username: profile.username };
    }

    async login(user: any) {
        const payload = { id: user.id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
