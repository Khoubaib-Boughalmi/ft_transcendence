import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraAuthGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		return activate;
	}
}

export class JwtGuard extends AuthGuard('jwt') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		return activate;
	}
}

export class JwtNo2faGuard extends AuthGuard('jwt-no-2fa') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		return activate;
	}
}
