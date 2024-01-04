import { Injectable } from '@nestjs/common';
import { Chat, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

    async create_chat(data: Prisma.ChatCreateInput): Promise<Chat> {
		return this.prisma.chat.create({
			data,
		});
	}

    async find_chat_with_users(userId1: string, userId2: string): Promise<Chat | null> {
        // In ChatUsers find the chats which has the two users
        const chat = await this.prisma.chat.findFirst({
            where: {
                users: {
                    hasEvery: [userId1, userId2],
                },
                isGroupChat: false,
            }
        });
        return chat;
    }

    async createOneToOneChat(userId1: string, userId2: string) {
        //find if chat already exists
        const chat = await this.find_chat_with_users(userId1, userId2);
        // if chat exists, return it
        if (chat) return chat;
        // if chat doesn't exist, create it
        return this.create_chat({
            isGroupChat: false,
            users: [userId1, userId2],
        });
    }
}
