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

@WebSocketGateway({
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private chatService: ChatService,
	) {}

	@WebSocketServer()
	private server: Server;
	private onlineUsers: Map<string, Socket[]> = new Map();

	async handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		const cookies = client?.handshake?.headers?.cookie;
		if (!cookies) return client.disconnect();
		const access_token = cookies
			.split('; ')!
			.find((cookie: string) => cookie.startsWith('access_token'))!
			.split('=')[1];
		await this.login(client, access_token);
		if (!client.data) return;
		await this.join_channels(client);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		if (!client.data) return;
		const sockets = this.onlineUsers[client.data.id];
		if (!sockets) return;
		const index = sockets.indexOf(client);
		if (index === -1) return;
		sockets.splice(index, 1);
	}

	async login(client: Socket, access_token: string) {
		const payload = await this.authService.verifyJWTforSocket(access_token);
		if (!payload) return client.disconnect();
		if (!payload?.two_factor_passed) return client.disconnect();

		this.onlineUsers[payload.id] = this.onlineUsers[payload.id] || [];
		this.onlineUsers[payload.id].push(client);
		client.data = { id: payload.id };
		console.log(`Client logged in: ${client.id}`);
	}

	async isOnline(id: string): Promise<boolean> {
		const sockets = this.onlineUsers[id];
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

		const chat = await this.chatService.chat({ id: payload.chat_id });
		if (!chat) return client.disconnect();

		const message = await this.chatService.createMessage({
			chat_id: chat.id,
			user_id: user.id,
			content: payload.message,
		});

		this.server.to(chat.id).emit('message', message);
	}
}
