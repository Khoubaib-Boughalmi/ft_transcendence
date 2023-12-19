import { Body, Controller, Get, HttpException, Param, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { IsLowercase, IsOptional, IsUUID, Length } from 'class-validator';
import { JwtGuard } from 'src/auth/auth.guards';

export class ProfileDTO {
    @IsLowercase()
    @Length(1, 36)
    @IsOptional()
    username: string;
}
export class AddFriendDTO {
    @IsUUID()
    id: string;
}

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @UseGuards(JwtGuard)
    @Get('profile/:username?')
    async getProfile(@Req() req, @Param() params: ProfileDTO) {
        // If no username is provided, return the profile of the logged in user
        if (!params.username) {
            return await this.userService.getProfileFull({ id: req.user.id });
        }
        // Otherwise, return the profile of the provided username
        return await this.userService.getProfileMini({ username: params.username });
    }

    @UseGuards(JwtGuard)
    @Post('addFriend')
    async addFriend(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        if (this.userService.isRelationExists(user.id, friend.id, 'friends'))
            throw new HttpException('Already friends', 400);
        if (this.userService.isRelationExists(friend.id, user.id, 'blocked'))
            throw new HttpException('You are blocked by this user', 400);
        await this.userService.addFriend(user.id, friend.id);
    }
}
