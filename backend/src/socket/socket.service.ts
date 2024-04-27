import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
	private onlineUsers: Map<string, Socket[]> = new Map();
	private playerGame: Map<string, { socket: Socket; gameId: string }[]> =
		new Map();

	private PlayesInGames: string[] = [];

	private gameInQueue: { socket: string; gameid: string } = {
		socket: '',
		gameid: '',
	};
	getGameInQueue() {
		return this.gameInQueue;
	}
	setGameInQueue(socket: string, gameid: string) {
		this.gameInQueue = { socket, gameid };
	}
	cleanGameInQueue() {
		this.gameInQueue = { socket: '', gameid: '' };
	}

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

	addPlayerGame(userId: string, socket: Socket, gameId: string) {
		if (this.playerGame.has(userId)) {
			console.log('should be eliminated');
			// this.playerGame.get(userId).push({ socket, gameId });
		} else {
			this.playerGame.set(userId, [{ socket, gameId }]);
		}
	}

	removePlayerGame(userId: string, socket: Socket) {
		if (this.playerGame.has(userId)) {
			this.playerGame.delete(userId);
			console.log('game removed');
		}
	}

	getPlayerGame(userId: string) {
		return this.playerGame.get(userId);
	}

	addPlayerToGame(userId: string) {
		if (!this.PlayesInGames.includes(userId))
			this.PlayesInGames.push(userId);
	}
	removePlayerFromGame(userId: string) {
		const index = this.PlayesInGames.indexOf(userId);
		// console.log('removing player', userId, index);
		// console.log('PlayesInGames BF', this.PlayesInGames);

		if (index !== -1) {
			this.PlayesInGames.splice(index, 1);
			// console.log('PlayesInGames AF', this.PlayesInGames);
		}
	}
	checkPlayerInGame(userId: string) {
		// console.log('PlayesInGames', this.PlayesInGames);
		return this.PlayesInGames.includes(userId);
	}
}
