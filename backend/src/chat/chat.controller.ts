import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	UseGuards,
	HttpException,
	UseInterceptors,
	UploadedFile,
	UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { IsLowercase, IsOptional, IsUUID, Length } from 'class-validator';
import { FormDataRequest } from 'nestjs-form-data';
import { JwtGuard } from 'src/auth/auth.guards';
import { Transform } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/user/user.controller';
import filetypeinfo from 'magic-bytes.js';
import { AppService } from 'src/app.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Message } from '@prisma/client';

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

export class ChannelRevokeBanDTO {
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

	@IsOptional()
	@Transform(({ value }) => (value == 'true' ? true : false))
	enable_password: boolean;

	@Length(6, 120)
	@IsOptional()
	password: string;

	@IsOptional()
	@Transform(({ value }) => (value == 'true' ? true : false))
	enable_inviteonly: boolean;
}

export class MessageDeleteDTO {
	@IsUUID()
	msgId: string;
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

	@Get('channel/search/:name?')
	@UseGuards(JwtGuard)
	async channelSearch(@Req() req, @Param() params) {
		const search = params?.name || '';

		const final = await this.chatService.chats({
			take: 8,
			where: {
				OR: [
					{ chatName: { contains: search, mode: 'insensitive' } },
					{
						chatDescription: {
							contains: search,
							mode: 'insensitive',
						},
					},
				],
				passwordProtected: false,
				inviteOnly: false,
				isGroupChat: true,
			},
		});
		return final;
	}

	@Get('channel/messages/:id')
	@UseGuards(JwtGuard)
	async channelMessages(@Req() req, @Param() params: ChannelUpdateDTO) {
		return this.chatService.getChatMessages(params.id);
	}

	@Post('channel/message/delete')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelMessageDelete(@Req() req, @Body() body: MessageDeleteDTO) {
		const message: Message = await this.chatService.message({
			id: body.msgId,
		});
		if (!message) throw new HttpException('Message not found', 404);
		// If it's a message by the owner then only the owner can delete it
		if (
			this.chatService.isChatOwner(message.user_id, message.chat_id) &&
			message.user_id !== req.user.id
		)
			throw new HttpException('You are not allowed to do that 1', 403);
		// If it's a message by someone else then only the owner or admin can delete it
		if (
			message.user_id !== req.user.id &&
			!this.chatService.isChatOwnerOrAdmin(req.user.id, message.chat_id)
		)
			throw new HttpException('You are not allowed to do that 2', 403);
		await this.chatService.deleteMessage(message);
	}

	@Get('channel/members/:id')
	@UseGuards(JwtGuard)
	async channelMembers(@Req() req, @Param() params: ChannelUpdateDTO) {
		const chat = await this.chatService.chat({ id: params.id });
		if (!chat) throw new HttpException('Channel not found', 404);

		const [members, invites, bans] = await Promise.all([
			this.chatService.getChatMembers(chat.id),
			this.chatService.getChatInvites(chat.id),
			this.chatService.getChatBans(chat.id),
		]);

		return {
			members,
			invites,
			bans,
			admins: chat.chatAdmins.map((admin) =>
				members.find((m) => m.id === admin),
			).filter((m) => m),
			owner: members.find((m) => m.id === chat.chatOwner),
		};
	}

	@Post('channel/create')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelCreate(@Req() req, @Body() body: GroupUsersDTO) {
		const chat = await this.chatService.chat({ chatName: body.name });
		if (chat) throw new HttpException('Channel name already in use', 400);

		const newChannel = await this.chatService.createChannel(
			req.user.id,
			body.name,
		);
		await this.chatService.joinChannelOnSocket(newChannel.id, req.user.id);
	}

	@Post('channel/join')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelJoin(@Req() req, @Body() body: ChannelJoinDTO) {
		const chat = await this.chatService.chat({ chatName: body.name });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (
			chat.passwordProtected &&
			(!body.password ||
				!bcrypt.compareSync(body?.password, chat.chatPassword))
		)
			throw new HttpException('Invalid password', 403);
		if (chat.bans.includes(req.user.id))
			throw new HttpException('You are banned from this channel', 403);
		if (chat.inviteOnly && !chat.invites.includes(req.user.id))
			throw new HttpException('You are not allowed to do that', 403);

		await this.chatService.joinChat(chat, req.user.id);
		await this.chatService.joinChannelOnSocket(chat.id, req.user.id);
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

		await this.chatService.leaveChat(chat, req.user.id);
		await this.chatService.leaveChannelOnSocket(chat.id, req.user.id);
	}

	@Post('channel/update')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelUpdate(@Req() req, @Body() body: ChannelUpdateDTO) {
		if (!this.chatService.isChatOwnerOrAdmin(req.user.id, body.id))
			throw new HttpException('You are not allowed to do that', 403);

		if (body.password) body.password = bcrypt.hashSync(body.password, 10);

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

	@Post('channel/revoke_ban')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelBanInvite(@Req() req, @Body() body: ChannelRevokeBanDTO) {
		const user = await this.userService.user({ id: body.userId });
		if (!user) throw new HttpException('User not found', 404);

		const chat = await this.chatService.chat({ id: body.chatId });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (!this.chatService.isChatOwnerOrAdmin(req.user.id, chat.id))
			throw new HttpException('You are not allowed to do that', 403);

		return this.chatService.revokeBan(chat, user);
	}

	@Post('channel/remove_admin')
	@UseGuards(JwtGuard)
	@FormDataRequest()
	async channelRemoveAdmin(@Req() req, @Body() body: ChannelRevokeBanDTO) {
		const user = await this.userService.user({ id: body.userId });
		if (!user) throw new HttpException('User not found', 404);

		const chat = await this.chatService.chat({ id: body.chatId });
		if (!chat) throw new HttpException('Channel not found', 404);
		if (!this.chatService.isChatOwnerOrAdmin(req.user.id, chat.id))
			throw new HttpException('You are not allowed to do that', 403);
		if (this.chatService.isChatOwner(user.id, chat.id))
			throw new HttpException('You are not allowed to do that', 403);
		return this.chatService.removeAdminFromChat(chat, user.id);
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
			if (!this.chatService.isChatOwnerOrAdmin(req.user.id, body.id))
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
		if (!this.chatService.isChatOwnerOrAdmin(req.user.id, body.id))
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
}
