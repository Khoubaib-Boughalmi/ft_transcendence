import { Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import { IntraAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Get('intra/login')
	@UseGuards(IntraAuthGuard)
	async handle42Login() {
		return 'This route uses 42 OAuth';
	}

	@Get('intra/redirect')
	@UseGuards(IntraAuthGuard)
	async handle42Redirect(@Req() req, @Res() res) {
		const { access_token } = await this.authService.login(req.user);
		res.redirect(process.env.FRONTEND_URL + '?token=' + access_token);
	}
}
