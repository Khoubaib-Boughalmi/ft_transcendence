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
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

export class UserDTO {
	@IsLowercase()
	@Length(33, 39)
	userId: string;
}

export class GroupUsersDTO {
	@Length(3, 100)
	name: string;
}

export class ChannelJoinDTO {
	@Length(3, 100)
	name: string;

	@Length(6, 120)
	@IsOptional()
	password: string;
}

export class ChannelInviteDTO {
	@IsUUID()
	id: string;

	@IsLowercase()
    @Length(1, 36)
	username: string;
}

export class ChannelRevokeInviteDTO {
	@IsUUID()
	userId: string;

	@IsUUID()
	chatId: string;
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
	@Transform(({ value }) => {
		return [true, 'true', '1', 1].indexOf(value) > -1;
	})
	@IsOptional()
	enable_password: boolean;

	@Length(6, 120)
	@IsOptional()
	password: string;

	@IsBoolean()
	@Transform(({ value }) => {
		return [true, 'true', '1', 1].indexOf(value) > -1;
	})
	@IsOptional()
	enable_inviteonly: boolean;
}

@Controller('chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly appService: AppService,
		private readonly userService: UserService,
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

	@Post('channel/join')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelJoin(@Req() req, @Body() body: ChannelJoinDTO) {
		const chat = await this.chatService.chat({ chatName: body.name });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (chat.passwordProtected && body.password && bcrypt.compareSync(body.password, chat.chatPassword))
			throw new HttpException('Invalid password', 403);
		if (chat.inviteOnly && !chat.invites.includes(req.user.id))
			throw new HttpException('You are not allowed to do that', 403);

		return this.chatService.joinChat(chat, req.user.id, body.password);
	}

	@Post('channel/leave')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelLeave(@Req() req, @Body() body: ChannelUpdateDTO) {
		const chat = await this.chatService.chat({ id: body.id });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (!chat.users.includes(req.user.id))
			throw new HttpException(
				'You are not a member of this channel',
				403,
			);

		return this.chatService.leaveChat(chat, req.user.id);
	}

	@Post('channel/update')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelUpdate(@Req() req, @Body() body: ChannelUpdateDTO) {
		if (!(await this.chatService.isChatOwnerOrAdmin(req.user.id, body.id)))
			throw new HttpException('You are not allowed to do that', 403);

        if (body.password)
            body.password = bcrypt.hashSync(body.password, 10);

		await this.chatService.updateChat({
			where: { id: body.id },
			data: {
				chatName: body.name,
				chatDescription: body.description,
				passwordProtected: body.enable_password,
				chatPassword: body.password,
				inviteOnly: body.enable_inviteonly,
			},
		});
	}

	@Post('channel/invite')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelInvite(@Req() req, @Body() body: ChannelInviteDTO) {
		const user = await this.userService.user({ username: body.username });
		if (!user) throw new HttpException('User not found', 404);

		const chat = await this.chatService.chat({ id: body.id });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (!chat.users.includes(req.user.id))
			throw new HttpException(
				'You are not a member of this channel',
				403,
			);
		if (!this.chatService.isChatOwnerOrAdmin(req.user.id, chat.id))
			throw new HttpException('You are not allowed to do that', 403);

		return this.chatService.inviteToChat(chat, user);
	}

	@Post('channel/revoke_invite')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelRevokeInvite(
		@Req() req,
		@Body() body: ChannelRevokeInviteDTO,
	) {
		const user = await this.userService.user({ id: body.userId });
		if (!user) throw new HttpException('User not found', 404);

		const chat = await this.chatService.chat({ id: body.chatId });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (!chat.users.includes(req.user.id))
			throw new HttpException(
				'You are not a member of this channel',
				403,
			);
		if (!this.chatService.isChatOwnerOrAdmin(req.user.id, chat.id))
			throw new HttpException('You are not allowed to do that', 403);

		return this.chatService.revokeInvite(chat, user);
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
