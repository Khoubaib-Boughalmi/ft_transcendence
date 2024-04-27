import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SocketService } from 'src/socket/socket.service';
import { Chat, GameMatch, Message, Prisma, User } from '@prisma/client';

@Injectable()
export class GameService {
	constructor(
		private prisma: PrismaService,
		private socketService: SocketService,
	) {}

	async startGame(server: any, client: any, payload: any) {
		this.socketService.addPlayerToGame(payload.player1Id);
		this.socketService.addPlayerToGame(payload.player2Id);
		// console.log('Game started', payload);
	}

	async createMatch(userId1: string, userId2: string): Promise<GameMatch> {
		console.log('Creating game match', userId1, userId2);

		const game = await this.createGame({
			player1_id: userId1,
			player2_id: userId2,
			player1_score: 0,
			player2_score: 0,
			winner_id: 'tie',
			duration: 0,
			game_type: '',
			game_league: '',
			game_map: '',
			game_ended: false,
		});
		console.log('Game created', game);
		return game;
	}

	async joinToQueuedGame(userId: string, matchId: string) {
		const game = await this.prisma.gameMatch.update({
			where: {
				id: matchId,
			},
			data: {
				player2_id: userId,
			},
		});
		return game;
	}

	async changeMatchScore(
		matchId: string,
		player1Score: number,
		player2Score: number,
		winner_id: string,
	): Promise<GameMatch> {
		const match = await this.prisma.gameMatch.update({
			where: {
				id: matchId,
			},
			data: {
				player1_score: player1Score,
				player2_score: player2Score,
				game_ended: true,
				winner_id: winner_id,
			},
		});
		return match;
	}

	async createGame(data: Prisma.GameMatchCreateInput): Promise<GameMatch> {
		const game: GameMatch = await this.prisma.gameMatch.create({
			data,
		});
		return game;
	}

	async getMatch(matchId: string): Promise<any> {
		const match = await this.prisma.gameMatch.findUnique({
			where: {
				id: matchId,
			},
		});
		const player1info = await this.prisma.user.findUnique({
			where: {
				id: match.player1_id,
			},
		});
		const player2info = await this.prisma.user.findUnique({
			where: {
				id: match.player2_id,
			},
		});
		// console.log('player1', player1);
		// console.log('player2', player2);
		// console.log('mtchh', match);
		return {
			...match,
			player1info,
			player2info,
		};

		// return match;
	}

	async joinMatch(matchId: string, player1or2: number) {
		const fieldToUpdate =
			player1or2 === 1 ? 'player1_joined' : 'player2_joined';
		const match = await this.prisma.gameMatch.update({
			where: {
				id: matchId,
			},
			data: {
				[fieldToUpdate]: true,
			},
		});
		return match;
	}
}
