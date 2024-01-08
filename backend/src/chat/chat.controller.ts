// router.route("/").post(verifyAuth, getOrCreateOneToOneChat).get(verifyAuth, getCurrentUserChats);
import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	Res,
	UseGuards,
    HttpException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
	IsArray,
	IsLowercase,
	IsOptional,
	Length,
	ValidateNested,
	isString,
} from 'class-validator';
import { FormDataRequest } from 'nestjs-form-data';
import { JwtGuard } from 'src/auth/auth.guards';
import { Type } from 'class-transformer';

export class UserDTO {
	@IsLowercase()
	@Length(33, 39)
	userId: string;
}

class GroupUsersDTO {
	@Length(3, 100)
	name: string;
}

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Get('/channel/list')
	@UseGuards(JwtGuard)
	async channelList(@Req() req) {
		return this.chatService.getCurrentUserChats(req.user.id);
	}

    @Post('/channel/create')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelCreate(
		@Req() req,
		@Body() body: GroupUsersDTO,
	) {
        const chat = await this.chatService.chat({ chatName: body.name });
        if (chat)
            throw new HttpException('Chat name already in use', 400);

		return this.chatService.createOneToManyChat(
			req.user.id,
			body.name,
		);
	}

    @UseGuards(JwtGuard)
	@Post('/createOneToOneChat')
	@FormDataRequest()
	async createOneToOneChat(@Req() req, @Body() body: UserDTO) {
		const { userId } = body;
		if (!userId) {
			return {
				error: 'userId is required',
			};
		}
		return this.chatService.createOneToOneChat(req.user.id, userId);
	}

	@Post('/sendMessage')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async sendMessage(@Req() req, @Body() body: any): Promise<any> {
		const { chatId, content } = body;
		if (!chatId || !content) {
			return {
				error: 'chatId and content are required',
			};
		}
		return this.chatService.sendMessage(req.user.id, chatId, content);
	}

	@Get('/getChatMessages/:chatId')
	@UseGuards(JwtGuard)
	async getChatMessages(@Req() req, @Param() params): Promise<any> {
		const { chatId } = params;
		if (!chatId) {
			return {
				error: 'chatId is required',
			};
		}
		return this.chatService.getChatMessages(chatId);
	}

	@Post('/updateChatInfo')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async updateChatInfo(@Req() req, @Body() body: any): Promise<any> {
		const { chatId, chatName, groupAdmins, chatPassword } = body;
		if (!chatId) {
			return {
				error: 'chatId is required',
			};
		}
		return this.chatService.updateChatInfo(
			chatId,
			chatName,
			groupAdmins,
			chatPassword,
		);
	}
}
