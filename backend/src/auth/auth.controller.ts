import { Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import { IntraAuthGuard } from './auth.guards';

@Controller('auth')
export class AuthController {
	@Get('intra/login')
	@UseGuards(IntraAuthGuard)
	async handle42Login() {
		return 'This route uses 42 OAuth';
	}

	@Get('intra/redirect')
	@UseGuards(IntraAuthGuard)
	async handle42Redirect(@Req() req, @Res() res) {
		res.redirect(process.env.FRONTEND_URL);
	}
}
