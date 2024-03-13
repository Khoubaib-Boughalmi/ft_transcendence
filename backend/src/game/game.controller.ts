import {
	Controller,
	Get,
	HttpException,
	Param,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { JwtGuard } from 'src/auth/auth.guards';
import { GameService } from './game.service';
import { log } from 'console';
import { Socket } from 'dgram';
import { SocketService } from 'src/socket/socket.service';
import { UserGateway } from 'src/user/user.gateway';

@Controller('game')
export class GameController {
	server: any;
	usergetway: any;
	constructor(
		private readonly gameService: GameService,
		private socketService: SocketService,
		private userGateway: UserGateway,
	) {}

	@UseGuards(JwtGuard)
	@Post('invite')
	// @FormDataRequest()
	async invite(@Req() req: any) {
		console.log('Game invite', req.body);
		const player = req.body.user1;
		const opponent = req.body.user2;
		console.log('Game invite', player, opponent);
		const game = await this.gameService.createMatch(player, opponent);
		// log('Game invite', game);
		return game;
	}

	@UseGuards(JwtGuard)
	@Post('joingame')
	async joinGame(@Req() req: any) {
		// console.log('Join game', req.body);

		const match = req.body.match_id;
		const player1or2 = req.body.player1or2;
		const game = await this.gameService.joinMatch(match, player1or2);
		console.log('Join game', game);
		const user1Sockets = this.socketService.getUserSockets(game.player1_id);
		const user2Sockets = this.socketService.getUserSockets(game.player2_id);
		// console.log('Join game', user1Sockets, user2Sockets);

		if (
			game.player1_joined &&
			game.player2_joined &&
			user1Sockets &&
			user2Sockets
		) {
			if (user1Sockets) {
				user1Sockets.forEach((socket) => {
					console.log('user1Sockets', socket.id);

					// socket.join(game.player1_id);
					socket.join(game.id);
				});
			}
			if (user2Sockets) {
				user2Sockets.forEach((socket) => {
					log('user2Sockets', socket.id);
					// socket.join(game.player2_id);
					socket.join(game.id);
				});
			}
			// this.socketService
			// 	.getUserSockets(game.player1_id)
			// 	.forEach((socket) => {
			// 		socket.join(game.id);
			// 	});

			// this.socketService
			// 	.getUserSockets(game.player2_id)
			// 	.forEach((socket) => {
			// 		socket.join(game.id);
			// 	});

			this.userGateway.game_start_emit(game.id, game);
		}
		return game;
	}

	@UseGuards(JwtGuard)
	@Get('match/:id?')
	async getProfile(@Req() req, @Param() params: any) {
		if (!params.id) {
			throw new HttpException('User not found', 404);
		}
		const match = await this.gameService.getMatch(params.id);
		if (!match) throw new HttpException('Match not found', 404);
		return match;
	}
}