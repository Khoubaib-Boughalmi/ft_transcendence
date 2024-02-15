import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { IsOptional, Length } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { SocketService } from 'src/socket/socket.service';
import { UserService } from './user.service';

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
		private chatService: ChatService,
		private socketService: SocketService,
	) {}

	@WebSocketServer()
	private server: Server;

	async handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		const cookies = client?.handshake?.headers?.cookie;
		if (!cookies) return client.disconnect();
		const access_token = cookies
			.split('; ')!
			.find((cookie: string) => cookie.startsWith('access_token'))!
			.split('=')[1];
		await this.login(client, access_token);
		if (!client.data || !client.data.id) return;
		await this.join_channels(client);
		console.log(`Socket joining all channels`, client.id);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		if (!client.data) return;
		this.socketService.removeUserSocket(client.data.id, client);
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
					chatInfo: this.chatService.getChatNameAndIconForNotifications(message.chatId),
				});
			}
		} catch (e) {
			throw e;
		} finally {
			this.turnEnded(payload);
		}
	}
}
