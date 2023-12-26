import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private authService: AuthService) {}

	@WebSocketServer()
	private server: Server;
	private onlineUsers: Map<string, Socket[]> = new Map();

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
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

	@SubscribeMessage('login')
	async handleLogin(client: Socket, data: any) {
		const payload = await this.authService.verifyJWTforSocket(data.access_token);
		if (!payload) return;
		if (!payload?.two_factor_passed) return;

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
