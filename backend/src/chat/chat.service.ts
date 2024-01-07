import { Injectable } from '@nestjs/common';
import {  Message, Chat, Prisma } from '@prisma/client';
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

    async updateChatInfo(chatId: string, chatName: string, groupAdmins: string[], chatPassword: string) {
        return await this.prisma.chat.update({
            where: {
                id: chatId,
            },
            data: {
                chatName,
                groupAdmins,
                chatPassword,
            },
        });
    }    
}
