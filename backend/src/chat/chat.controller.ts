// router.route("/").post(verifyAuth, getOrCreateOneToOneChat).get(verifyAuth, getCurrentUserChats);
import { Controller, Get, Post, Body, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { IsArray, IsLowercase, IsOptional, Length, ValidateNested, isString } from 'class-validator';
import { FormDataRequest } from 'nestjs-form-data';
import { JwtGuard } from 'src/auth/auth.guards';
import { Type } from 'class-transformer';

export class UserDTO {
    @IsLowercase()
    @Length(33, 39)
    userId: string;
}

class GroupUsersDTO {
    @IsArray()
    @Length(1, undefined, { each: true }) // Ensure array has at least one element
    @IsLowercase({ each: true }) // Ensure each element is lowercase
    groupUsers: string[];

    @Length(3, 100)
    groupName: string;
  }
  


@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @UseGuards(JwtGuard)
    @Post("/createOneToOneChat")
    @FormDataRequest()
    async createOneToOneChat(@Req() req, @Body() body: UserDTO): Promise<any> {
        const { userId } = body;
        if (!userId) {
            return {
                error: "userId is required",
            };
        }
        return await this.chatService.createOneToOneChat(req.user.id, userId);
    }

    @Get("/getCurrentUserChats")
    @UseGuards(JwtGuard)
    async getCurrentUserChats(@Req() req): Promise<any> {
        return await this.chatService.getCurrentUserChats(req.user.id);
    }

    @Post("/createOneToManyChat")
    @UseGuards(JwtGuard)
    @FormDataRequest()
    async createOneToManyChat(@Req() req, @Body() body: GroupUsersDTO): Promise<any> {
        const { groupUsers, groupName } = body;
        if (!groupUsers || !groupName) {
            return {
                error: "users and group name are required",
            };
        }
        return await this.chatService.createOneToManyChat(req.user.id, groupUsers, groupName);
    }
}
