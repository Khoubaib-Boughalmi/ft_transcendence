import {
	Controller,
	Req,
	Res,
	Get,
	UseGuards,
	Body,
	HttpException,
	Post,
	Param,
} from '@nestjs/common';
import { IntraAuthGuard, JwtGuard, JwtNo2faGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserService } from 'src/user/user.service';
import { FormDataRequest } from 'nestjs-form-data';
import { IsString } from 'class-validator';

export class Enable2faDTO {
	@IsString()
	otp: string;
}

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@Get('intra/login')
	@UseGuards(IntraAuthGuard)
	async handle42Login() {
		return 'This route uses 42 OAuth';
	}

	@Get('intra/redirect')
	@UseGuards(IntraAuthGuard)
	async handle42Redirect(@Req() req, @Res() res) {
		const user = await this.userService.user({ id: req.user.id });
		if (!user)
			throw new HttpException('User not found', 404);
		const { access_token } = await this.authService.login(user);
		res.cookie('access_token', access_token, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		});
		// When the user logs in for the first time, we redirect them to the frontend settings page
		if (user.isFirstLogin) {
			res.redirect(`${process.env.FRONTEND_URL}/settings`);
			await this.userService.updateUser({
				where: { id: user.id },
				data: { isFirstLogin: false },
			});
		} else {
			res.redirect(process.env.FRONTEND_URL);
		}
	}

	@Get('bypass/:username?')
	async bypassAuth(@Req() req, @Param() params: any, @Res() res) {
		if (process.env.NODE_ENV !== 'development')
			throw new HttpException('Not found', 404);
		console.log("Bypassing auth for user: ", params);
		const user = await this.userService.user({ username: params.username });
		if (!user)
			throw new HttpException('User not found', 404);
		const { access_token } = await this.authService.login2fa(user);
		res.cookie('access_token', access_token, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		});
		res.redirect(process.env.FRONTEND_URL);
	}

	@Get('2fa/generate')
	@UseGuards(JwtGuard)
	async generate2faSecret(@Req() req) {
		const user = await this.userService.user({ id: req.user.id });
		if (user.two_factor) {
			throw new HttpException('2FA is already enabled', 400);
		}
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			process.env.APP_NAME,
			secret,
		);
		await this.userService.updateUser({
			where: { id: req.user.id },
			data: { two_factor_secret: secret },
		});
		return toDataURL(otpauthUrl);
	}

	@Post('2fa/enable')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async enable2fa(@Req() req, @Body() body: Enable2faDTO) {
		const user = await this.userService.user({ id: req.user.id });
		if (user.two_factor) {
			throw new HttpException('2FA is already enabled', 400);
		}
		const isValid = authenticator.verify({
			token: body.otp,
			secret: user.two_factor_secret,
		});
		if (!isValid) {
			throw new HttpException('Invalid OTP', 400);
		}
		await this.userService.updateUser({
			where: { id: req.user.id },
			data: { two_factor: true },
		});
		return '2FA enabled';
	}

	@Post('2fa/disable')
	@UseGuards(JwtGuard)
	async disable2fa(@Req() req) {
		const user = await this.userService.user({ id: req.user.id });
		if (!user.two_factor) {
			throw new HttpException('2FA is already disabled', 400);
		}
		await this.userService.updateUser({
			where: { id: req.user.id },
			data: { two_factor: false },
		});
		return '2FA disabled';
	}

	@Post('2fa/login')
	@UseGuards(JwtNo2faGuard)
	@FormDataRequest()
	async login2fa(@Req() req, @Res() res, @Body() body: Enable2faDTO) {
		const user = await this.userService.user({ id: req.user.id });
		if (!user.two_factor) {
			throw new HttpException('2FA is not enabled', 400);
		}
		const isValid = authenticator.verify({
			token: body.otp,
			secret: user.two_factor_secret,
		});
		if (!isValid) {
			throw new HttpException('Invalid OTP', 400);
		}
		const { access_token } = await this.authService.login2fa(user);
		res.cookie('access_token', access_token, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		});
		res.send();
	}

	@Get('verify')
	@UseGuards(JwtNo2faGuard)
	async verifyToken() {
		return 'Token is valid';
	}

	@Get('logout')
	@UseGuards(JwtNo2faGuard)
	async logout(@Res() res) {
		res.clearCookie('access_token');
		res.send();
	}
}
