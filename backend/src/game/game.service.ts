import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SocketService } from 'src/socket/socket.service';
import { Chat, GameMatch, Message, Prisma, User } from '@prisma/client';

@Injectable()
export class GameService {
	constructor(
		private prisma: PrismaService,
		// private socketService: SocketService,
	) {}

	async startGame(server: any, client: any, payload: any) {
		console.log('Game started');
		// const user = await this.prisma.user.findUnique({
		// 	where: {
		// 		id: userId,
		// 	},
		// });
	}

	async createMatch(userId1: string, userId2: string): Promise<GameMatch> {
		console.log('Creating game match', userId1, userId2);

		const game = await this.createGame({
			player1_id: userId1,
			player2_id: userId2,
			player1_score: 0,
			player2_score: 0,
			winner_id: '',
			duration: 0,
			game_type: '',
			game_league: '',
			game_map: '',
		});
		console.log('Game created', game);
		return game;
	}

	async createGame(data: Prisma.GameMatchCreateInput): Promise<GameMatch> {
		const game: GameMatch = await this.prisma.gameMatch.create({
			data,
		});
		return game;
	}

	async getMatch(matchId: string): Promise<GameMatch> {
		const match = await this.prisma.gameMatch.findUnique({
			where: {
				id: matchId,
			},
		});
		return match;
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
