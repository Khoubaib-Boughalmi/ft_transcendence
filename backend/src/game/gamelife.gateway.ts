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
import { GameService } from '../game/game.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({ namespace: 'game' })
export class GamelifeGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	// constructor(private authService: AuthService) {}
	@WebSocketServer()
	private server: Server;

	async handleConnection(client: Socket) {
		// console.log(`Client connected: ${client.id}`);
		// const cookies = client?.handshake?.headers?.cookie;
		// if (!cookies) return client.disconnect();
		// let access_token = null;
		// try {
		// 	access_token = cookies
		// 		.split('; ')!
		// 		.find((cookie: string) => cookie.startsWith('access_token'))!
		// 		.split('=')[1];
		// } catch (e) {
		// 	return client.disconnect();
		// }
		// await this.login(client, access_token);
		// if (!client.data || !client.data.id) return;

		const COLOR_RED = '\x1b[31m';
		const COLOR_RESET = '\x1b[0m';
		console.log(COLOR_RED, `Game socket alive`, client.id, COLOR_RESET);
	}

	async login(client: Socket, access_token: string) {
		// const payload = await this.authService.verifyJWTforSocket(access_token);
		// if (!payload) return client.disconnect();
		// if (!payload?.two_factor_passed) return client.disconnect();
		// console.log(`Client logged in: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Gamelife socket disconnected: ${client.id}`);
	}
}
