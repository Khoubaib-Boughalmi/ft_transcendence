import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraAuthGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		return activate;
	}
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<any> {
		const req = context.switchToHttp().getRequest();
		return req.isAuthenticated();
	}
}
