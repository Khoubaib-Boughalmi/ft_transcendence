// router.route("/").post(verifyAuth, getOrCreateOneToOneChat).get(verifyAuth, getAllCurrentUserChats);
import { Controller, Get, Post, Body, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { IsLowercase, IsOptional, Length } from 'class-validator';
import { FormDataRequest } from 'nestjs-form-data';
import { JwtGuard } from 'src/auth/auth.guards';

export class UserDTO {
    @IsLowercase()
    @Length(1, 36)
    @IsOptional()
    userId: string;
}


@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @UseGuards(JwtGuard)
    @Post("/createOneToOneChat")
    @FormDataRequest()
    async createOneToOneChat(@Req() req, @Body() body: UserDTO): Promise<any> {
        const { userId } = body;
        return await this.chatService.createOneToOneChat(req.user.id, userId);
    }

}
