import { Injectable } from '@nestjs/common';
import { Strategy as IntraBaseStrategy, Profile } from 'passport-42';
import { Strategy as JwtBaseStrategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class IntraStrategy extends PassportStrategy(IntraBaseStrategy) {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.INTRA_CLIENT_ID,
			clientSecret: process.env.INTRA_CLIENT_SECRET,
			callbackURL: process.env.INTRA_CALLBACK_URL,
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
	) {
		return this.authService.validateUser(profile);
	}
}

const cookieExtractor = (req: any): string | null => {
	let token = null;
	if (req && req.cookies) {
		token = req.cookies.access_token;
	}
	return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtBaseStrategy, 'jwt') {
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: cookieExtractor,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	validate(payload) {
		return this.authService.validateJwt(payload, true);
	}
}

@Injectable()
export class JwtNo2faStrategy extends PassportStrategy(
	JwtBaseStrategy,
	'jwt-no-2fa',
) {
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: cookieExtractor,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	validate(payload) {
		return this.authService.validateJwt(payload, false);
	}
}
