import { Injectable } from '@nestjs/common';
import { Chat, Message, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserProfileMicro, UserService } from 'src/user/user.service';
import { SocketService } from 'src/socket/socket.service';
import { WsException } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';
import { UserGateway } from 'src/user/user.gateway';

export type ChatChannel = {
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
	isDM: boolean;
	membersIds: string[];
};

export type ChatMessage = {
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
		private userGateWay: UserGateway,
	) {
		// On server start, cache all the chat channels
		this.prisma.chat.findMany().then((chats: Chat[]) => {
			chats.forEach((chat) => {
				this.chatsCache[chat.id] = chat;
			});
		});
	}

	private chatsCache: Record<string, Chat> = {};

	async chat(
		chatWhereUniqueInput: Prisma.ChatWhereUniqueInput,
	): Promise<Chat | null> {
		if (this.chatsCache[chatWhereUniqueInput.id])
			return this.chatsCache[chatWhereUniqueInput.id];
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

	async updateOneToOnes(
		chats: ChatChannel[],
		userId: string,
	): Promise<ChatChannel[]> {
		await Promise.all(
			chats.map(async (chat) => {
				if (!chat.isDM) return;
				const otherUser = chat.membersIds.find((id) => id !== userId);
				if (!otherUser) return;
				const otherUserProfile = await this.userService.getProfileMicro(
					{
						id: otherUser,
					},
				);
				if (!otherUserProfile) return;
				chat.name = otherUserProfile.username;
				chat.icon = otherUserProfile.avatar;
			}),
		);
		return chats;
	}

	async createChat(data: Prisma.ChatCreateInput): Promise<Chat> {
		const chat: Chat = await this.prisma.chat.create({
			data,
		});
		this.chatsCache[chat.id] = chat;
		return chat;
	}

	async findChatWithUsers(
		userId1: string,
		userId2: string,
	): Promise<Chat | null> {
		const chat = Object.values(this.chatsCache).find(
			(chat) =>
				chat.users.includes(userId1) &&
				chat.users.includes(userId2) &&
				!chat.isGroupChat,
		);
		return chat;
	}

	async createDM(userId1: string, userId2: string): Promise<Chat> {
		//find if chat already exists
		const chat = await this.findChatWithUsers(userId1, userId2);
		// if chat exists, return it
		if (chat) return chat;

		const target = await this.userService.user({
			id: userId2,
		});
		if (!target) throw new WsException('Invalid target');
		// if chat doesn't exist, create it
		return this.createChat({
			isGroupChat: false,
			users: [userId1, userId2],
			chatName: uuidv4(),
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
				membersIds: chat.users,
				admins: chat.chatAdmins,
				enable_password: chat.passwordProtected,
				enable_inviteonly: chat.inviteOnly,
				invites: chatInvites,
				size: chat.users.length,
				isDM: !chat.isGroupChat,
			});
		}
		return chats;
	}

	getChatNameAndIconForNotifications(chatId: string) {
		return this.chatsCache[chatId] && this.chatsCache[chatId].isGroupChat
			? {
					name: this.chatsCache[chatId].chatName,
					icon: this.chatsCache[chatId].chatIcon,
				}
			: null;
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

		// Update the one to ones
		const updatedChats = await this.updateOneToOnes(chats, userId);

		// Remove Dm's by blocked users
		const blockedUsers = await this.userService.getBlockedUsers(userId);
		const filteredChats = updatedChats.filter((chat) => {
			if (chat.isDM) {
				const otherUser = chat.membersIds.find((id) => id !== userId);
				if (
					blockedUsers.find(
						(blockedUser) => blockedUser.id === otherUser,
					)
				) {
					return false;
				}
			}
			return true;
		});
		return filteredChats;
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
		const chat = this.chatsCache[chatId];
		return {
			...message,
			user,
			chat,
		};
	}

	async processMessage(
		user: User,
		payload: any,
	): Promise<ChatMessage | null> {
		let chat: Chat = this.chatsCache[payload.chatId];

		// If a target is specified, handle DMs
		if (payload.targetId) {
			chat = await this.createDM(user.id, payload.targetId);
			if (!chat) throw new WsException('Invalid chat');

			// Join the user to the chat
			this.socketService.getUserSockets(user.id)?.forEach((socket) => {
				socket.join(chat.id);
			});

			// Join the target to the chat
			this.socketService
				.getUserSockets(payload.targetId)
				?.forEach((socket) => {
					socket.join(chat.id);
				});
		}

		if (!chat) throw new WsException('Invalid chat');
		if (chat.isGroupChat && !chat.users.includes(user.id))
			throw new WsException('Invalid chat');

		const message = await this.createMessage(
			{
				chat_id: chat.id,
				user_id: user.id,
				content: payload.message,
			},
			payload,
		);
		return message;
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

		const isTargetOk = (target: User, chat: Chat) => {
			return (
				target &&
				target.id !== data.user_id &&
				target.id !== chat.chatOwner
			);
		};

		const commands = {
			kick: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				await this.leaveChat(chat, target.id);
				await this.leaveChannelOnSocket(chat.id, target.id);
				this.socketService
					.getUserSockets(target.id)
					?.forEach((socket) =>
						socket.emit('mutate', `/chat/channel/list`),
					);
				return `${target.username} has been kicked from the channel.`;
			},
			ban: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				await this.leaveChat(chat, target.id);
				await this.leaveChannelOnSocket(chat.id, target.id);
				await this.updateChat({
					where: {
						id: chat.id,
					},
					data: {
						bans: {
							push: target.id,
						},
					},
				});
				this.socketService
					.getUserSockets(target.id)
					?.forEach((socket) =>
						socket.emit('mutate', `/chat/channel/list`),
					);
				return `${target.username} has been banned from the channel.`;
			},
			unban: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				await this.revokeBan(chat, target);
				return `${target.username} has been unbanned from the channel.`;
			},
			mute: async (args: string[], chat: Chat) => {
				if (!args[0] || !args[1])
					throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				const duration = Number(args[1]);
				if (isNaN(duration))
					throw new WsException(errors.invalidDuration);
				const endTimestamp = Date.now() + duration * 1000;
				const newMutes = chat.mutes.filter(
					(mute) =>
						mute.split(':')[0] !== target.id &&
						Number(mute.split(':')[1]) > Date.now(),
				);
				newMutes.push(`${target.id}:${endTimestamp}`);
				await this.updateChat({
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
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				await this.updateChat({
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
			op: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				await this.updateChat({
					where: {
						id: chat.id,
					},
					data: {
						chatAdmins: {
							push: target.id,
						},
					},
				});
				return `${target.username} has been promoted to admin.`;
			},
			unop: async (args: string[], chat: Chat) => {
				if (!args[0]) throw new WsException(errors.invalidArgs);
				const target = await this.userService.user({
					username: args[0],
				});
				if (!isTargetOk(target, chat))
					throw new WsException(errors.invalidTarget);
				await this.removeAdminFromChat(chat, target.id);
				return `${target.username} has been demoted from admin.`;
			},
		};
		const { content, chat_id } = data;
		if (!content.startsWith('/')) return null;
		const args = content.split(' ');
		const command = args.shift().slice(1);
		const chat = this.chatsCache[chat_id];
		if (!chat) throw new WsException(errors.invalidChat);
		if (
			!chat.chatAdmins.includes(data.user_id) &&
			data.user_id != chat.chatOwner
		)
			throw new WsException(errors.invalidPermissions);
		if (!chat.isGroupChat) throw new WsException(errors.invalidChat);
		if (!commands[command]) throw new WsException(errors.invalidCommand);

		return await commands[command](args, chat);
	}

	getMuteTimeRemaining(chat: Chat, userId: string) {
		const mute = chat.mutes.find(
			(mute) =>
				mute.split(':')[0] === userId &&
				Number(mute.split(':')[1]) > Date.now(),
		);
		return mute
			? Math.ceil((Number(mute.split(':')[1]) - Date.now()) / 1000)
			: 0;
	}

	async createMessage(
		data: Prisma.MessageCreateInput,
		payload: any,
	): Promise<ChatMessage> {
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
			const chat = this.chatsCache[data.chat_id];
			if (!chat) throw new WsException('Invalid chat');

			// if the user is muted, throw an exception
			const muteTime = this.getMuteTimeRemaining(chat, data.user_id);
			if (muteTime > 0) {
				throw new WsException({
					message: `You are muted for ${muteTime} more seconds.`,
					chatId: data.chat_id,
					queueId: payload.queueId,
				});
			}

			// if it's a DM, check if the target is blocked
			if (!chat.isGroupChat) {
				const target_blocks = await this.userService.getBlockedUsers(
					payload.targetId,
				);
				if (
					target_blocks.find(
						(target_profile) => target_profile.id === data.user_id,
					)
				) {
					throw new WsException({
						message: `Your message could not be delivered.`,
						chatId: data.chat_id,
						queueId: payload.queueId,
					});
				}
			}

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

	async message(
		messageWhereUniqueInput: Prisma.MessageWhereUniqueInput,
	): Promise<Message | null> {
		return this.prisma.message.findUnique({
			where: messageWhereUniqueInput,
		});
	}

	async deleteMessage(message: Message) {
		await this.prisma.message.delete({
			where: {
				id: message.id,
			},
		});

		const chat = this.chatsCache[message.chat_id];
		this.userGateWay.mutateChat(
			chat.id,
			`/chat/channel/messages/${chat.id}`,
		);
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
		const chat = this.chatsCache[chatId];
		if (!chat) return [];
		const members = await this.userService.getMicroProfiles(chat.users);
		return members;
	}

	async getChatInvites(chatId: string): Promise<UserProfileMicro[]> {
		const chat = this.chatsCache[chatId];
		if (!chat) return [];
		const invites = await this.userService.getMicroProfiles(chat.invites);
		return invites;
	}

	async getChatBans(chatId: string): Promise<UserProfileMicro[]> {
		const chat = this.chatsCache[chatId];
		if (!chat) return [];
		const bans = await this.userService.getMicroProfiles(chat.bans);
		return bans;
	}

	async getChatAdmins(chatId: string): Promise<UserProfileMicro[]> {
		const chat = this.chatsCache[chatId];
		if (!chat) return [];
		const admins = await this.userService.getMicroProfiles(chat.chatAdmins);
		return admins;
	}

	async joinChat(chat: Chat, userId: string, password?: string) {
		await this.updateChat({
			where: { id: chat.id },
			data: { users: { push: userId } },
		});
	}

	async removeAdminFromChat(chat: Chat, userId: string) {
		await this.updateChat({
			where: { id: chat.id },
			data: {
				chatAdmins: {
					set: chat.chatAdmins.filter((id) => id !== userId),
				},
			},
		});
	}

	async removeOwnerFromChat(chat: Chat, userId: string) {
		await this.updateChat({
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
			const chatUpdated: Chat = await this.prisma.chat.delete({
				where: {
					id: chat.id,
					users: {
						isEmpty: true,
					},
				},
			});
			delete this.chatsCache[chat.id];
		} catch (e) {}
	}

	async leaveChat(chat: Chat, userId: string) {
		await this.updateChat({
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
		const chat: Chat = await this.prisma.chat.update({
			data,
			where,
		});
		this.chatsCache[chat.id] = chat;
		return chat;
	}

	isChatOwner(userId: string, chatId: string): boolean {
		const chat = this.chatsCache[chatId];
		return chat?.chatOwner === userId || false;
	}

	isChatAdmin(userId: string, chatId: string): boolean {
		const chat = this.chatsCache[chatId];
		return chat?.chatAdmins?.includes(userId) || false;
	}

	isChatOwnerOrAdmin(userId: string, chatId: string): boolean {
		return (
			this.isChatOwner(userId, chatId) || this.isChatAdmin(userId, chatId)
		);
	}

	async inviteToChat(chat: Chat, user: User) {
		await this.updateChat({
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
		await this.updateChat({
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

	async revokeBan(chat: Chat, user: User) {
		await this.updateChat({
			where: {
				id: chat.id,
			},
			data: {
				bans: {
					set: chat.bans.filter((id) => id !== user.id),
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
