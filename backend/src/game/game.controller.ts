import {
	Controller,
	Get,
	HttpException,
	Param,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/auth.guards';
import { GameService } from './game.service';
import { log } from 'console';
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
		const getPlayerGame = this.socketService.getPlayerGame(req.body.user1);
		// if (getPlayerGame) {
		// 	throw new HttpException('You are already in a game', 400);
		// }
		const player = req.body.user1;
		const opponent = req.body.user2;
		const game = await this.gameService.createMatch(
			player,
			opponent,
			'friendly',
		);
		console.log('addplayer data', req.body.user1, req.body.socket, game.id);

		this.socketService.addPlayerGame(
			req.body.user1,
			req.body.socket,
			game.id,
		);
		console.log(
			'getPlayerGame',
			this.socketService.getPlayerGame(req.body.user1),
		);
		return game;
	}

	@UseGuards(JwtGuard)
	@Post('JoinQueueing')
	// @FormDataRequest()
	async JoinQueueing(@Req() req: any) {
		const getPlayerGame = this.socketService.getPlayerGame(req.body.user1);
		if (getPlayerGame) {
			throw new HttpException('You are already in a game', 400);
		}

		let ThegameInQueue = this.socketService.getGameInQueue();
		console.log('ThegameInQueue', ThegameInQueue.gameid);
		while (ThegameInQueue.gameid == '-1') {
			await new Promise((resolve) => setTimeout(resolve, 10));
			ThegameInQueue = this.socketService.getGameInQueue();
		}

		if (ThegameInQueue.gameid) {
			console.log('Yougonna join to ', ThegameInQueue);
			const game = await this.gameService.joinToQueuedGame(
				req.body.user1,
				ThegameInQueue.gameid,
			);
			this.userGateway.announceWaitingPlayer(game.id);

			this.socketService.cleanGameInQueue();
			return game;
		} else {
			ThegameInQueue.gameid = '-1';
			const game = await this.gameService.createMatch(
				req.body.user1,
				'-1',
				'arena',
			);
			this.socketService.setGameInQueue(req.body.socket, game.id);
			console.log("You're in queue");
			return game;
		}
	}

	// ToDO : exceptions handling for al endpoints,  -ingame status- ,-ping in game- , -leaderboard- , archivement . -maps- . logic of queueing , -remove adding exp in friendly match-

	@UseGuards(JwtGuard)
	@Post('joingame')
	async joinGame(@Req() req: any) {
		const match = req.body.match_id;
		const player1or2 = req.body.player1or2;
		const game = await this.gameService.joinMatch(match, player1or2);
		const user1Sockets = this.socketService.getUserSockets(game.player1_id);
		const user2Sockets = this.socketService.getUserSockets(game.player2_id);

		if (
			game.player1_joined &&
			game.player2_joined &&
			user1Sockets &&
			user2Sockets
		) {
			if (user1Sockets) {
				user1Sockets.forEach((socket) => {
					console.log('user1Sockets', socket.id);

					socket.join(game.id);
				});
			}
			if (user2Sockets) {
				user2Sockets.forEach((socket) => {
					log('user2Sockets', socket.id);
					socket.join(game.id);
				});
			}

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
