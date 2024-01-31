import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { ChatService } from 'src/chat/chat.service';
import { SocketService } from 'src/socket/socket.service';

@WebSocketGateway({
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
	wsEngine: require('ws').Server,
})
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

	@SubscribeMessage('message')
	async handleMessage(client: Socket, payload: any) {
		const user = await this.userService.user({ id: client.data.id });
		if (!user) return client.disconnect();

		console.log(payload);

		let chat: any;

		if (payload.targetId) {
			chat = await this.chatService.createDM(
				user.id,
				payload.targetId,
			);
			if (!chat) return client.disconnect();
			client.join(chat.id);
			this.socketService.getUserSockets(payload.targetId)?.forEach((socket) => {
				socket.join(chat.id);
			});
		} else {
			chat = await this.chatService.chat({ id: payload.chatId });
			if (!chat) return client.disconnect();
		}

		const message = await this.chatService.createMessage({
			chat_id: chat.id,
			user_id: user.id,
			content: payload.message,
		});

		console.log('Finished Processing ' + payload.message);

		if (message) this.server.to(chat.id).emit('message', message);
	}
}
