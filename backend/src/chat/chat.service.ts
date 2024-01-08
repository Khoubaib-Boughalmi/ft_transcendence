import { Injectable } from '@nestjs/common';
import { Message, Chat, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserDTO } from './chat.controller';
import { UserProfileMicro, UserService } from 'src/user/user.service';

type ChatChannel = {
    name: string;
	description: string;
	icon: string;
	id: string;
	members: UserProfileMicro[];
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
		});

        // Create the list of chat channels
        let chats: ChatChannel[] = [];
        userChats.forEach(chat => {
            // Get the micro profile of each chat member
            const chatMembers: UserProfileMicro[] = [];
            chat.users.forEach(async userId => {
                const user = await this.userService.getProfileMicro({ id: userId });
                chatMembers.push(user);
            });

            // Populate the chat channel info
            chats.push({
                id: chat.id,
                name: chat.chatName,
                description: chat.chatDescription,
                icon: chat.chatIcon,
                members: chatMembers,
            });
        });
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

	async getChatMessages(chatId: string) {
		const messages = await this.prisma.message.findMany({
			where: {
				chat_id: chatId,
			},
		});
		// populate the messages with the users
		let messagesWithUsers = [];
		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];
			const user = await this.prisma.user.findUnique({
				where: {
					id: message.user_id,
				},
			});
			messagesWithUsers[i] = {
				...message,
				user,
			};
		}
		return messagesWithUsers;
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
}
