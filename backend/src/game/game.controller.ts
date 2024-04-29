import {
	Body,
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
import { FormDataRequest } from 'nestjs-form-data';
import {
	IsNumber,
	IsOptional,
	IsUUID,
	Length,
	isNumber,
} from 'class-validator';

export class GameInviteDTO {
	@IsUUID()
	user1: string;

	@IsUUID()
	user2: string;

	@Length(3, 100)
	socket: string;
}

export class joinGameDTO {
	@IsUUID()
	match_id: string;
	@IsUUID()
	player_id: string;

	@Length(3, 100)
	socket_id: string;

	@IsNumber()
	player1or2: number;
}

export class JoinQueueingDTO {
	@IsUUID()
	user1: string;

	@Length(3, 100)
	socket: string;
}

export class getProfileDTO {
	@IsUUID()
	id: string;
}

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
	@FormDataRequest()
	async invite(@Req() req, @Body() body: GameInviteDTO) {
		const player = body.user1;
		const opponent = body.user2;
		const game = await this.gameService.createMatch(
			player,
			opponent,
			'friendly',
		);
		this.socketService.addPlayerGame(body.user1, body.socket, game.id);
		return game;
	}

	@UseGuards(JwtGuard)
	@Post('JoinQueueing')
	@FormDataRequest()
	async JoinQueueing(@Req() req, @Body() body: JoinQueueingDTO) {
		const getPlayerGame = this.socketService.getPlayerGame(body.user1);
		if (getPlayerGame) {
			throw new HttpException('You are already in a game', 400);
		}

		let ThegameInQueue = this.socketService.getGameInQueue();
		while (ThegameInQueue.gameid == '-1') {
			await new Promise((resolve) => setTimeout(resolve, 10));
			ThegameInQueue = this.socketService.getGameInQueue();
		}

		if (ThegameInQueue.gameid) {
			const game = await this.gameService.joinToQueuedGame(
				body.user1,
				ThegameInQueue.gameid,
			);
			this.userGateway.announceWaitingPlayer(game.id);

			this.socketService.cleanGameInQueue();
			return game;
		} else {
			ThegameInQueue.gameid = '-1';
			const game = await this.gameService.createMatch(
				body.user1,
				'-1',
				'arena',
			);
			this.socketService.setGameInQueue(body.socket, game.id);
			return game;
		}
	}

	// ToDO : exceptions handling for al endpoints,  -ingame status- ,-ping in game- , -leaderboard- , archivement . -maps- . logic of queueing , -remove adding exp in friendly match-

	@UseGuards(JwtGuard)
	@Post('joingame')
	@FormDataRequest()
	async joinGame(@Req() req, @Body() body: joinGameDTO) {
		const match = body.match_id;
		const player1or2 = body.player1or2;
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
					socket.join(game.id);
				});
			}
			if (user2Sockets) {
				user2Sockets.forEach((socket) => {
					socket.join(game.id);
				});
			}

			this.userGateway.game_start_emit(game.id, game);
		}
		return game;
	}

	@UseGuards(JwtGuard)
	@Get('match/:id?')
	async getProfile(@Req() req, @Param() params: getProfileDTO) {
		if (!params.id) {
			throw new HttpException('User not found', 404);
		}
		const match = await this.gameService.getMatch(params.id);
		if (!match) throw new HttpException('Match not found', 404);
		return match;
	}
}
