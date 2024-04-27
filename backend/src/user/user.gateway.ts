import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { IsOptional, Length } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { SocketService } from 'src/socket/socket.service';
import { UserService } from './user.service';
import { GameService } from '../game/game.service';
import { Inject, forwardRef } from '@nestjs/common';

export class MessageDTO {
	@IsOptional()
	chatId: string;

	@IsOptional()
	targetId: string;

	queueId: string;

	@Length(1, 1024)
	message: string;
}

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		@Inject(forwardRef(() => ChatService))
		private chatService: ChatService,
		private socketService: SocketService,
		private gameService: GameService,
	) {}

	@WebSocketServer()
	private server: Server;

	async handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		const cookies = client?.handshake?.headers?.cookie;
		if (!cookies) return client.disconnect();
		let access_token = null;
		try {
			access_token = cookies
				.split('; ')!
				.find((cookie: string) => cookie.startsWith('access_token'))!
				.split('=')[1];
		} catch (e) {
			return client.disconnect();
		}
		await this.login(client, access_token);
		if (!client.data || !client.data.id) return;
		await this.join_channels(client);
		console.log(`Socket joining all channels`, client.id);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		if (!client.data) return;
		this.socketService.removeUserSocket(client.data.id, client);
		this.socketService.removePlayerGame(client.data.id, client);
		// const getPlayerGame = this.socketService.getPlayerGame(client.data.id);
		// console.log('getPlayerGame', getPlayerGame);
	}

	async login(client: Socket, access_token: string) {
		const payload = await this.authService.verifyJWTforSocket(access_token);
		if (!payload) return client.disconnect();
		if (!payload?.two_factor_passed) return client.disconnect();

		this.socketService.addUserSocket(payload.id, client);
		client.data = { id: payload.id };
		console.log(`Client logged in: ${client.id}`);
	}

	async isOnline(id: string): Promise<boolean> {
		const sockets = this.socketService.getUserSockets(id);
		if (!sockets) return false;
		return sockets.length > 0;
	}

	async join_channels(client: Socket) {
		const user = await this.userService.user({ id: client.data.id });
		if (!user) return client.disconnect();

		const channels = await this.chatService.getCurrentUserChats(user.id);
		if (!channels) return;
		for (const channel of channels) {
			client.join(channel.id);
		}
	}

	async mutateChat(chatId: string, payload: any) {
		this.server.to(chatId).emit('mutate', payload);
	}

	async game_start_emit(gameId: string, payload: any) {
		this.server.to(gameId).emit('game-start', payload);
	}
	async announceWaitingPlayer(gameId: string) {
		this.server.to(gameId).emit('announceWaitingPlayer');
	}

	// async numberofOnlineUsers() {
	// 	return this.socketService.numberofOnlineUsers();
	// }

	private MessageProcessingQueue: string[][] = [];

	queueMessage(payload: any) {
		if (!this.MessageProcessingQueue[payload.chatId])
			this.MessageProcessingQueue[payload.chatId] = [];
		this.MessageProcessingQueue[payload.chatId].push(payload.queueId);
	}

	async waitForTurn(payload: any) {
		while (
			this.MessageProcessingQueue[payload.chatId][0] != payload.queueId
		) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	turnEnded(payload: any) {
		this.MessageProcessingQueue[payload.chatId].shift();
	}

	@SubscribeMessage('message')
	async handleMessage(client: Socket, payload: MessageDTO) {
		this.queueMessage(payload);
		await this.waitForTurn(payload);

		const user = await this.userService.user({ id: client.data.id });
		if (!user) return client.disconnect();

		try {
			const message = await this.chatService.processMessage(
				user,
				payload,
			);
			if (message) {
				this.server
					.to(message.chatId)
					.emit('message', { ...message, queueId: payload.queueId });
				this.server.to(message.chatId).emit('notifications', {
					...message,
					queueId: payload.queueId,
					chatInfo:
						this.chatService.getChatNameAndIconForNotifications(
							message.chatId,
						),
				});
			}
		} catch (e) {
			throw e;
		} finally {
			this.turnEnded(payload);
		}
	}

	@SubscribeMessage('start_game')
	async start_game(client: Socket, payload: any) {
		this.gameService.startGame(this.server, client, payload);
	}

	@SubscribeMessage('game_over')
	async game_over(client: Socket, payload: any) {
		this.socketService.removePlayerFromGame(payload.player1_id);
		this.socketService.removePlayerFromGame(payload.player2_id);
		console.log('game_over', payload);
		console.log('score', {
			score: {
				player1: payload.mypoints,
				player2: payload.oppPoints2,
			},
			winner_id:
				payload.mypoints == payload.oppPoints2
					? 'tie'
					: payload.mypoints > payload.oppPoints2
						? payload.player1_id
						: payload.player2_id,
		});
		this.server.to(payload.gameId).emit('recieve_game_data', {
			score: { player1: payload.mypoints, player2: payload.oppPoints2 },
		});
		const winner_id =
			payload.mypoints == payload.oppPoints2
				? 'tie'
				: payload.mypoints > payload.oppPoints2
					? payload.player1_id
					: payload.player2_id;

		this.gameService.changeMatchScore(
			payload.game_id,
			payload.mypoints,
			payload.oppPoints2,
			winner_id,
		);
		// if (winner_id == 'tie') {
		this.userService.addexp(payload.player1_id, winner_id);
		this.userService.addexp(payload.player2_id, winner_id);
		// }
		this.userService.addMatchToHistory(payload.player1_id, payload.game_id);
		this.userService.addMatchToHistory(payload.player2_id, payload.game_id);
	}

	@SubscribeMessage('game_data')
	async game_data(client: Socket, payload: any) {
		// console.log('game_data', payload.gameId);

		// console.log('game_data', payload);
		this.server.to(payload.gameId).emit('recieve_game_data', payload);
		// console.log('game_data', payload);

		// this.socketService.addPlayerToGame(payload.player1_id);
		// this.socketService.addPlayerToGame(payload.player2_id);
		// emit game data to the other player but not to the sender
		// const opponentId = payload.opponentId;
		// const opponentSockets = this.socketService.getUserSockets(opponentId);
		// if (!opponentSockets) return;
		// opponentSockets.forEach((socket) => {
		// 	if (socket.id != client.id) {
		// 		socket.emit('recieve_game_data', payload);
		// 	}
		// });
		// send game data to the other player
		// this.server.to(payload.opponentId).emit('recieve_game_data', payload);
		// this.gameService.gameData(this.server, client, payload);
	}

	@SubscribeMessage('playerIsReady')
	async playerIsReady(client: Socket, payload: any) {
		console.log('playerIsReady', payload);
		this.server.to(payload.gameId).emit('palyer_ready', payload);
	}
	@SubscribeMessage('playerIsAlive')
	async playerIsAlive(client: Socket, payload: any) {
		console.log('playerIsAlive', payload);
		// this.server.to(payload.gameId).emit('palyer_alive', payload);
	}
	@SubscribeMessage('playerGone')
	async playerGone(client: Socket, payload: any) {
		console.log('playerGone', payload);
		// this.server.to(payload.gameId).emit('player_gone', payload);
	}
	@SubscribeMessage('leavegame')
	async leavegame(client: Socket, payload: any) {
		console.log('leavegame', payload);
		// this.gameService.leaveGame(this.server, client, payload);
	}
}
