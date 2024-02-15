import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
	private onlineUsers: Map<string, Socket[]> = new Map();

	addUserSocket(userId: string, socket: Socket) {
		if (this.onlineUsers.has(userId)) {
			this.onlineUsers.get(userId).push(socket);
		} else {
			this.onlineUsers.set(userId, [socket]);
		}
	}

	removeUserSocket(userId: string, socket: Socket) {
		if (this.onlineUsers.has(userId)) {
			const userSockets = this.onlineUsers.get(userId);
			const index = userSockets.findIndex((s) => s.id === socket.id);
			if (index !== -1) {
				userSockets.splice(index, 1);
			}
			if (userSockets.length === 0) {
				this.onlineUsers.delete(userId);
			}
		}
	}

	getUserSockets(userId: string) {
		return this.onlineUsers.get(userId);
	}
}
