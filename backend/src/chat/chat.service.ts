import { Injectable } from '@nestjs/common';
import { Message, Chat, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserDTO } from './chat.controller';
import { UserProfileMicro, UserService } from 'src/user/user.service';
import { SocketService } from 'src/socket/socket.service';
import { WsException } from '@nestjs/websockets';

type ChatChannel = {
	name: string;
	description: string;
	icon: string;
	id: string;
	owner: string;
	members?: UserProfileMicro[];
	admins: string[];
	enable_password: boolean;
	enable_inviteonly: boolean;
	invites?: UserProfileMicro[];
	size?: number;
};

type ChatMessage = {
	id: string;
	chatId: string;
	user: UserProfileMicro;
	content: string;
	createdAt: Date;
	updatedAt: Date;
};

@Injectable()
export class ChatService {
	constructor(
		private prisma: PrismaService,
		private userService: UserService,
		private socketService: SocketService,
	) {}

	async chat(
		chatWhereUniqueInput: Prisma.ChatWhereUniqueInput,
	): Promise<Chat | null> {
		return this.prisma.chat.findUnique({
			where: chatWhereUniqueInput,
		});
	}

	async chats(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.ChatWhereUniqueInput;
		where?: Prisma.ChatWhereInput;
	}): Promise<ChatChannel[]> {
		const { skip, take, cursor, where } = params;
		const result = await this.prisma.chat.findMany({
			skip,
			take,
			cursor,
			where,
		});
		result.sort((a, b) => b.users.length - a.users.length);
		const chats = await this.convertChatsFormat(result, {
			members: false,
			invites: false,
		});
		return chats;
	}

	async createChat(data: Prisma.ChatCreateInput): Promise<Chat> {
		return this.prisma.chat.create({
			data,
		});
	}

	async findChatWithUsers(
		userId1: string,
		userId2: string,
	): Promise<Chat | null> {
		// In ChatUsers find the chats which has the two users
		const chat = await this.prisma.chat.findFirst({
			where: {
				users: {
					hasEvery: [userId1, userId2],
				},
				isGroupChat: false,
			},
		});
		return chat;
	}

	async createOneToOneChat(userId1: string, userId2: string) {
		//find if chat already exists
		const chat = await this.findChatWithUsers(userId1, userId2);
		// if chat exists, return it
		if (chat) return chat;
		// if chat doesn't exist, create it
		return this.createChat({
			isGroupChat: false,
			users: [userId1, userId2],
			chatName: '',
		});
	}

	async convertChatsFormat(
		inputChats: Chat[],
		include: {
			members: boolean;
			invites: boolean;
		} = {
			members: true,
			invites: true,
		},
	): Promise<ChatChannel[]> {
		let chats: ChatChannel[] = [];
		for (const chat of inputChats) {
			// Get the micro profile of each chat member
			const chatMembers: UserProfileMicro[] =
				include.members &&
				(await this.userService.getMicroProfiles(chat.users));
			const chatInvites: UserProfileMicro[] =
				include.invites &&
				(await this.userService.getMicroProfiles(chat.invites));

			// Populate the chat channel info
			chats.push({
				id: chat.id,
				name: chat.chatName,
				description: chat.chatDescription,
				icon: chat.chatIcon,
				owner: chat.chatOwner,
				members: chatMembers,
				admins: chat.chatAdmins,
				enable_password: chat.passwordProtected,
				enable_inviteonly: chat.inviteOnly,
				invites: chatInvites,
				size: chat.users.length,
			});
		}
		return chats;
	}

	async getCurrentUserChats(userId: string) {
		// Find all the chats where the user is a member
		const userChats = await this.prisma.chat.findMany({
			where: {
				users: {
					has: userId,
				},
			},
			orderBy: {
				created_at: 'asc',
			},
		});

		// Create the list of chat channels
		const chats = await this.convertChatsFormat(userChats, {
			invites: false,
			members: false,
		});
		return chats;
	}

	async createChannel(userId: string, channelName: string) {
		const chat = await this.createChat({
			isGroupChat: true,
			chatName: channelName,
			users: [userId],
			chatOwner: userId,
		});
		return chat;
	}

	async sendMessage(userId: string, chatId: string, content: string) {
		const data: Prisma.MessageCreateInput = {
			content,
			chat_id: chatId,
			user_id: userId,
		};
		const message = await this.prisma.message.create({
			data,
		});
		// populate the message with the user and chat
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});
		return {
			...message,
			user,
			chat,
		};
	}

	async processCommand(data: Prisma.MessageCreateInput) {
		const errors = {
			invalidCommand: 'Invalid command.',
			invalidArgs: 'Invalid arguments.',
			invalidTarget: 'Invalid target.',
			invalidDuration: 'Invalid duration.',
			invalidChat: 'Invalid channel.',
			invalidPermissions: 'Invalid permissions.',
		};
		const commands = {
			kick: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!target) throw new WsException(errors.invalidTarget);
				await this.leaveChat(chat, target.id);
				await this.leaveChannelOnSocket(chat.id, target.id);
				this.socketService.getUserSockets(target.id)?.forEach((socket) => socket.emit('mutate', `/chat/channel/list`));
				return `${target.username} has been kicked from the channel.`;
			},
			ban: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!target) throw new WsException(errors.invalidTarget);
				await this.leaveChat(chat, target.id);
				await this.leaveChannelOnSocket(chat.id, target.id);
				await this.prisma.chat.update({
					where: {
						id: chat.id,
					},
					data: {
						bans: {
							push: target.id,
						},
					},
				});
				this.socketService.getUserSockets(target.id)?.forEach((socket) => socket.emit('mutate', `/chat/channel/list`));
				return `${target.username} has been banned from the channel.`;
			},
			unban: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!target) throw new WsException(errors.invalidTarget);
				await this.prisma.chat.update({
					where: {
						id: chat.id,
					},
					data: {
						bans: {
							set: chat.bans.filter((id) => id !== target.id),
						},
					},
				});
				return `${target.username} has been unbanned from the channel.`;
			},
			mute: async (args: string[], chat: Chat) => {
				if (!args[0] || !args[1])
					throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!target) throw new WsException(errors.invalidTarget);
				const duration = Number(args[1]);
				if (isNaN(duration))
					throw new WsException(errors.invalidDuration);
				const endTimestamp = Date.now() + duration * 1000;
				const newMutes = chat.mutes.filter(
					(mute) => mute.split(':')[0] !== target.id && Number(mute.split(':')[1]) > Date.now()
				);
				newMutes.push(`${target.id}:${endTimestamp}`);
				await this.prisma.chat.update({
					where: {
						id: chat.id,
					},
					data: {
						mutes: {
							set: newMutes,
						},
					},
				});
				return `${target.username} has been muted for ${duration} seconds.`;
			},
			unmute: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!target) throw new WsException(errors.invalidTarget);
				await this.prisma.chat.update({
					where: {
						id: chat.id,
					},
					data: {
						mutes: {
							set: chat.mutes.filter(
								(mute) => mute.split(':')[0] !== target.id,
							),
						},
					},
				});
				return `${target.username} has been unmuted.`;
			},
		};
		const { content, chat_id } = data;
		if (!content.startsWith('/')) return null;
		const args = content.split(' ');
		const command = args.shift().slice(1);
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chat_id,
			},
		});
		if (!chat) throw new WsException(errors.invalidChat);
		if (
			!(
				chat.chatAdmins.includes(data.user_id) ||
				chat.chatOwner === data.user_id
			)
		)
			throw new WsException(errors.invalidPermissions);
		if (!chat.isGroupChat) throw new WsException(errors.invalidChat);
		if (!commands[command]) throw new WsException(errors.invalidCommand);

		return await commands[command](args, chat);
	}

	async createMessage(data: Prisma.MessageCreateInput): Promise<ChatMessage> {
		const serverMessage = await this.processCommand(data);
		if (serverMessage !== null) {
			const newData = {
				...data,
				content: serverMessage,
				user_id: 'server',
			};
			const message = await this.prisma.message.create({ data: newData });
			return {
				id: message.id,
				chatId: message.chat_id,
				user: {
					id: 'server',
				} as any,
				content: message.content,
				createdAt: message.created_at,
				updatedAt: message.updated_at,
			};
		} else {
			const chat = await this.prisma.chat.findUnique({
				where: {
					id: data.chat_id,
				},
			});
			if (!chat) throw new WsException('Invalid chat');
			const mute = chat.mutes.find(
				(mute) =>
					mute.split(':')[0] === data.user_id &&
					Number(mute.split(':')[1]) > Date.now(),
			);
			if (mute) throw new WsException(`You are muted for ${Math.ceil((Number(mute.split(':')[1]) - Date.now()) / 1000)} more seconds.`);

			const message = await this.prisma.message.create({ data });
			const userProfile = await this.userService.getProfileMicro({
				id: data.user_id,
			});
			return {
				id: message.id,
				chatId: message.chat_id,
				user: userProfile,
				content: message.content,
				createdAt: message.created_at,
				updatedAt: message.updated_at,
			};
		}
	}

	async getChatMessages(chatId: string) {
		const chatMessages = await this.prisma.message.findMany({
			where: {
				chat_id: chatId,
			},
			orderBy: {
				created_at: 'desc',
			},
		});

		// Create a set of unique user ids and get their micro profiles
		const userProfiles = await this.userService.getMicroProfiles([
			...new Set(chatMessages.map((message) => message.user_id)),
		]);

		// Populate the messages with the user and chat
		let messages: ChatMessage[] = [];
		for (const message of chatMessages) {
			messages.push({
				id: message.id,
				chatId: message.chat_id,
				user:
					message.user_id == 'server'
						? ({
								id: 'server',
						  } as any)
						: userProfiles.find(
								(user) => user.id === message.user_id,
						  ),
				content: message.content,
				createdAt: message.created_at,
				updatedAt: message.updated_at,
			});
		}
		return messages;
	}

	async getChatMembers(chatId: string): Promise<UserProfileMicro[]> {
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});
		if (!chat) return [];
		const members = await this.userService.getMicroProfiles(chat.users);
		return members;
	}

	async getChatInvites(chatId: string): Promise<UserProfileMicro[]> {
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});
		if (!chat) return [];
		const invites = await this.userService.getMicroProfiles(chat.invites);
		return invites;
	}

	async getChatBans(chatId: string): Promise<UserProfileMicro[]> {
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});
		if (!chat) return [];
		const bans = await this.userService.getMicroProfiles(chat.bans);
		return bans;
	}

	async joinChat(chat: Chat, userId: string, password?: string) {
		await this.prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				users: {
					push: userId,
				},
			},
		});
	}

	async removeAdminFromChat(chat: Chat, userId: string) {
		await this.prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				chatAdmins: {
					set: chat.chatAdmins.filter((id) => id !== userId),
				},
			},
		});
	}

	async removeOwnerFromChat(chat: Chat, userId: string) {
		await this.prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				chatOwner: '',
			},
		});
	}

	async deleteEmptyChat(chat: Chat) {
		// Try to delete the chat if it's empty
		try {
			await this.prisma.chat.delete({
				where: {
					id: chat.id,
					users: {
						isEmpty: true,
					},
				},
			});
		} catch (e) {}
	}

	async leaveChat(chat: Chat, userId: string) {
		await this.prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				users: {
					set: chat.users.filter((id) => id !== userId),
				},
			},
		});

		// If you were a chat admin, remove you from the chat admins
		if (chat.chatAdmins.includes(userId))
			await this.removeAdminFromChat(chat, userId);

		// If you were the chat owner, remove the chat owner
		if (chat.chatOwner === userId)
			await this.removeOwnerFromChat(chat, userId);

		// If the chat is empty, delete it
		await this.deleteEmptyChat(chat);
	}

	async updateChat(params: {
		where: Prisma.ChatWhereUniqueInput;
		data: Prisma.ChatUpdateInput;
	}): Promise<Chat> {
		const { where, data } = params;
		return this.prisma.chat.update({
			data,
			where,
		});
	}

	async isChatOwner(userId: string, chatId: string): Promise<boolean> {
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});
		return chat?.chatOwner === userId || false;
	}

	async isChatAdmin(userId: string, chatId: string): Promise<boolean> {
		const chat = await this.prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});
		return chat?.chatAdmins?.includes(userId) || false;
	}

	async isChatOwnerOrAdmin(userId: string, chatId: string): Promise<boolean> {
		return (
			(await this.isChatOwner(userId, chatId)) ||
			(await this.isChatAdmin(userId, chatId))
		);
	}

	async inviteToChat(chat: Chat, user: User) {
		await this.prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				invites: {
					push: user.id,
				},
			},
		});
	}

	async revokeInvite(chat: Chat, user: User) {
		await this.prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				invites: {
					set: chat.invites.filter((id) => id !== user.id),
				},
			},
		});
	}

	async joinChannelOnSocket(chatId: string, userId: string) {
		const sockets = this.socketService.getUserSockets(userId);
		if (!sockets) return;
		for (const socket of sockets) socket.join(chatId);
	}

	async leaveChannelOnSocket(chatId: string, userId: string) {
		const sockets = this.socketService.getUserSockets(userId);
		if (!sockets) return;
		for (const socket of sockets) socket.leave(chatId);
	}
}
