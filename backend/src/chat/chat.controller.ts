import { Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
    ) { }

    @Get()
    getChat(): string {
        return 'Chat';
    }

    @Post('channel/create')
    async createChannel() {
        console.log('Creating channel');
        await this.chatService.createChannel({
            name: 'General',
            description: 'General chat channel',
            users: ["user1"],
            messages: [],
            type: 'public',
            invitedUsers: [],
            password: '',
            admins: ["user1"]
        });
    }
}
