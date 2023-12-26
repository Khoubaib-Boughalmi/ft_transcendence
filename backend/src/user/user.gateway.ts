import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private authService: AuthService) {}

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
}
