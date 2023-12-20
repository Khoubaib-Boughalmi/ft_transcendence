import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { IsLowercase, IsOptional, IsUUID, Length } from 'class-validator';
import { JwtGuard } from 'src/auth/auth.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from 'src/app.service';

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
        private readonly appService: AppService,
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
    @Post('settings/update')
    async updateSettings(@Req() req, @Body() body: ProfileDTO) {
        const alreadyExists = await this.userService.user({ username: body.username });
        if (alreadyExists)
            throw new HttpException('Username already exists', 400);
        await this.userService.updateUser({ where: { id: req.user.id }, data: { username: body.username } });
        return { message: 'Settings updated' };
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    @Post('settings/upload-avatar')
    async updateSettingsUploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
        const res = await this.appService.s3_upload(file);
        await this.userService.updateUser({ where: { id: req.user.id }, data: { avatar: res } });
        return { message: 'Avatar updated' };
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('banner'))
    @Post('settings/upload-banner')
    async updateSettingsUploadBanner(@Req() req, @UploadedFile() file: Express.Multer.File) {
        const res = await this.appService.s3_upload(file);
        await this.userService.updateUser({ where: { id: req.user.id }, data: { banner: res } });
        return { message: 'Banner updated' };
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
