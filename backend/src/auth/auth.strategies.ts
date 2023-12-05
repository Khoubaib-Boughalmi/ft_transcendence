import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.INTRA_CLIENT_ID,
			clientSecret: process.env.INTRA_CLIENT_SECRET,
			callbackURL: process.env.INTRA_CALLBACK_URL,
		});
	}

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
		return this.authService.validateUser(profile);
	}
}
