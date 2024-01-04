import { Injectable } from '@nestjs/common';
import { Chat, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserDTO } from './chat.controller';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

    async createChat(data: Prisma.ChatCreateInput): Promise<Chat> {
		return this.prisma.chat.create({
			data,
		});
	}

    async findChatWithUsers(userId1: string, userId2: string): Promise<Chat | null> {
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
        const chat = await this.findChatWithUsers(userId1, userId2);
        // if chat exists, return it
        if (chat) return chat;
        // if chat doesn't exist, create it
        return this.createChat({
            isGroupChat: false,
            users: [userId1, userId2],
        });
    }

    //get all chats of current user in this format: [chat, user1, user2, ...]
    async getCurrentUserChats(userId: string) {
        const userChats =  await this.prisma.chat.findMany({
            where: {
                users: {
                    has: userId,
                },
            },
        });

        // populate the userChats with the users
        let userChatsWithUsers = [];
        for (let i = 0; i < userChats.length; i++) {
            const chat = userChats[i];
            const users = await this.prisma.user.findMany({
                where: {
                    id: {
                        in: chat.users,
                    },
                },
            });
            userChatsWithUsers[i] = [chat, ...users];
        }
        return userChatsWithUsers;
    }

    async createOneToManyChat(userId: string, groupUsers: string[], groupName: string) {
        // create the chat
        const chat = await this.createChat({
            isGroupChat: true,
            users: [userId, ...groupUsers],
            chatName: groupName,
            groupAdmins: [userId],
        });
        // populate the chat with the users
        const users = await this.prisma.user.findMany({
            where: {
                id: {
                    in: chat.users,
                },
            },
        });
        return {
            ...chat,
            users,
        }; 
    }
    
}
