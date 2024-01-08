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
	UseInterceptors,
	UploadedFile,
	UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
	IsArray,
	IsBoolean,
	IsLowercase,
	IsOptional,
	IsUUID,
	Length,
	ValidateNested,
	isString,
} from 'class-validator';
import { FormDataRequest } from 'nestjs-form-data';
import { JwtGuard } from 'src/auth/auth.guards';
import { Transform, Type } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/user/user.controller';
import filetypeinfo from 'magic-bytes.js';
import { AppService } from 'src/app.service';

export class UserDTO {
	@IsLowercase()
	@Length(33, 39)
	userId: string;
}

export class GroupUsersDTO {
	@Length(3, 100)
	name: string;
}

export class ChannelUpdateDTO {
	@IsUUID()
	id: string;

	@Length(3, 16)
	@IsOptional()
	name: string;

	@Length(6, 120)
	@IsOptional()
	description: string;

	@IsBoolean()
    @Transform(({ value }) => { return [true, 'true', '1', 1].indexOf(value) > -1; })  
	@IsOptional()
	enable_password: boolean;

	@Length(6, 120)
	@IsOptional()
	password: string;
}

@Controller('chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly appService: AppService,
	) {}

	@Get('channel/list')
	@UseGuards(JwtGuard)
	async channelList(@Req() req) {
		return this.chatService.getCurrentUserChats(req.user.id);
	}

	@Post('channel/create')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelCreate(@Req() req, @Body() body: GroupUsersDTO) {
		const chat = await this.chatService.chat({ chatName: body.name });
		if (chat) throw new HttpException('Channel name already in use', 400);

		return this.chatService.createOneToManyChat(req.user.id, body.name);
	}

	@Post('channel/update')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelUpdate(@Req() req, @Body() body: ChannelUpdateDTO) {
		if (!(await this.chatService.isChatOwnerOrAdmin(req.user.id, body.id)))
			throw new HttpException('You are not allowed to do that', 403);

		await this.chatService.updateChat({
			where: { id: body.id },
			data: {
				chatName: body.name,
				chatDescription: body.description,
				passwordProtected: body.enable_password,
				chatPassword: body.password,
			},
		});
	}

	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor('icon', multerConfig))
	@Post('channel/upload-icon')
	async channelUploadIcon(
		@Req() req,
		@Body() body: ChannelUpdateDTO,
		@UploadedFile() file: Express.Multer.File,
	) {
		try {
			// Validate the permissions
			if (
				!(await this.chatService.isChatOwnerOrAdmin(
					req.user.id,
					body.id,
				))
			)
				throw new HttpException('You are not allowed to do that', 403);
			// Validate the magic bytes
			const fileType = filetypeinfo(file.buffer);
			const isImage = fileType.some(({ typename }) =>
				['png', 'gif', 'jpg', 'jpeg'].includes(typename),
			);
			if (!isImage) throw new UnsupportedMediaTypeException();
			// Upload to S3
			const res = await this.appService.s3_upload(file);
			await this.chatService.updateChat({
				where: { id: body.id },
				data: { chatIcon: res },
			});
			return { message: 'Icon updated' };
		} catch (err) {
			throw new UnsupportedMediaTypeException();
		}
	}

	@UseGuards(JwtGuard)
	@Post('channel/delete-icon')
	@FormDataRequest()
	async channelDeleteIcon(@Req() req, @Body() body: ChannelUpdateDTO) {
		if (!(await this.chatService.isChatOwnerOrAdmin(req.user.id, body.id)))
			throw new HttpException('You are not allowed to do that', 403);
		await this.chatService.updateChat({
			where: { id: body.id },
			data: {
				chatIcon:
					'https://i.ytimg.com/vi/FNXf9XkUZ0M/maxresdefault.jpg',
			},
		});
		return { message: 'Icon deleted' };
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
		return this.chatService.updateChat({
			where: { id: chatId },
			data: { chatName, chatAdmins: groupAdmins, chatPassword },
		});
	}
}
