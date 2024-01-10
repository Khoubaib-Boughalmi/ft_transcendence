import { Injectable } from '@nestjs/common';
import { Message, Chat, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserDTO } from './chat.controller';
import { UserProfileMicro, UserService } from 'src/user/user.service';

type ChatChannel = {
    name: string;
	description: string;
	icon: string;
	id: string;
	owner: string;
	members: UserProfileMicro[];
	admins: string[];
    enable_password: boolean;
	enable_inviteonly: boolean;
	invites: UserProfileMicro[];
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
    ) {}

    async chat(
		chatWhereUniqueInput: Prisma.ChatWhereUniqueInput,
	): Promise<Chat | null> {
		return this.prisma.chat.findUnique({
			where: chatWhereUniqueInput,
		});
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
        let chats: ChatChannel[] = [];
        for (const chat of userChats) {
            // Get the micro profile of each chat member
            const chatMembers: UserProfileMicro[] = await this.userService.getMicroProfiles(chat.users);
			const chatInvites: UserProfileMicro[] = await this.userService.getMicroProfiles(chat.invites);

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
            });
        }
        return chats;
    }

	async createOneToManyChat(
		userId: string,
		groupName: string,
	) {
		// create the chat
		const chat = await this.createChat({
			isGroupChat: true,
			chatName: groupName,
			users: [userId],
			chatOwner: userId,
		});
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

	async createMessage(data: Prisma.MessageCreateInput): Promise<ChatMessage> {
		const message = await this.prisma.message.create({ data });
		const userProfile = await this.userService.getProfileMicro({ id: data.user_id });
		return {
			id: message.id,
			chatId: message.chat_id,
			user: userProfile,
			content: message.content,
			createdAt: message.created_at,
			updatedAt: message.updated_at,
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
		const userProfiles = await this.userService.getMicroProfiles([...new Set(chatMessages.map(message => message.user_id))]);

		// Populate the messages with the user and chat
		let messages: ChatMessage[] = [];
		for (const message of chatMessages) {
			messages.push({
				id: message.id,
				chatId: message.chat_id,
				user: userProfiles.find((user) => user.id === message.user_id),
				content: message.content,
				createdAt: message.created_at,
				updatedAt: message.updated_at,
			});
		}
		return messages;
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
				chatOwner: "",
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
        return await this.isChatOwner(userId, chatId) || await this.isChatAdmin(userId, chatId);
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
}
