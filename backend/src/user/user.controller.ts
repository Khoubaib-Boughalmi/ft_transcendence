import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { IsLowercase, IsOptional, IsUUID, Length } from 'class-validator';
import { JwtGuard } from 'src/auth/auth.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from 'src/app.service';
import { FormDataRequest } from 'nestjs-form-data';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import filetypeinfo from 'magic-bytes.js';
import { UserGateway } from './user.gateway';

export class ProfileDTO {
    @IsLowercase()
    @Length(1, 36)
    @IsOptional()
    username: string;
}

export class UserSearchDTO {
    @IsLowercase()
    @Length(1, 36)
    username: string;
}

export class AddFriendDTO {
    @IsUUID()
    id: string;
}

export const multerConfig = {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/))
            callback(null, false);
        else
            callback(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
    },
};

@Controller('user')
export class UserController {
    constructor(
        private readonly appService: AppService,
        private readonly userService: UserService,
        private readonly userGateway: UserGateway,
    ) { }

    @UseGuards(JwtGuard)
    @Get('profile/:username?')
    async getProfile(@Req() req, @Param() params: ProfileDTO) {
        // If no username is provided, return the profile of the logged in user
        if (!params.username) {
            const user = await this.userService.getProfileFull({ id: req.user.id });
            if (!user)
                throw new HttpException('User not found', 404);
            return user;
        }
        // Otherwise, return the profile of the provided username
        const user = await this.userService.getProfileMini({ username: params.username });
        if (!user)
            throw new HttpException('User not found', 404);
        return user;
    }

    @UseGuards(JwtGuard)
    @Get('profile/isonline/:id')
    async getProfileIsOnline(@Req() req, @Param() params: AddFriendDTO) {
        const user = await this.userService.user({ id: params.id });
        if (!user)
            throw new HttpException('User not found', 404);
        return { isOnline: await this.userGateway.isOnline(user.id) };
    }

    @UseGuards(JwtGuard)
    @Post('settings/update')
    @FormDataRequest()
    async updateSettings(@Req() req, @Body() body: ProfileDTO) {
        const alreadyExists = await this.userService.user({ username: body.username });
        if (alreadyExists)
            throw new HttpException('Username already exists', 400);
        await this.userService.updateUser({ where: { id: req.user.id }, data: { username: body.username } });
        return { message: 'Settings updated' };
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('avatar', multerConfig))
    @Post('settings/upload-avatar')
    async updateSettingsUploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
        try {
            // Validate the magic bytes
            const fileType = filetypeinfo(file.buffer);
            const isImage = fileType.some(({ typename }) => ['png', 'gif', 'jpg', 'jpeg'].includes(typename));
            if (!isImage)
                throw new UnsupportedMediaTypeException();
            // Upload to S3
            const res = await this.appService.s3_upload(file);
            await this.userService.updateUser({ where: { id: req.user.id }, data: { avatar: res } });
            return { message: 'Avatar updated' };
        } catch (err) {
            throw new UnsupportedMediaTypeException();
        }
    }

    @UseGuards(JwtGuard)
    @Post('settings/delete-avatar')
    async updateSettingsDeleteAvatar(@Req() req) {
        await this.userService.updateUser({ where: { id: req.user.id }, data: { avatar: "https://i.ytimg.com/vi/FNXf9XkUZ0M/maxresdefault.jpg" } });
        return { message: 'Avatar deleted' };
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('banner', multerConfig))
    @Post('settings/upload-banner')
    async updateSettingsUploadBanner(@Req() req, @UploadedFile() file: Express.Multer.File) {
        try {
            // Validate the magic bytes
            const fileType = filetypeinfo(file.buffer);
            const isImage = fileType.some(({ typename }) => ['png', 'gif', 'jpg', 'jpeg'].includes(typename));
            if (!isImage)
                throw new UnsupportedMediaTypeException();
            // Upload to S3
            const res = await this.appService.s3_upload(file);
            await this.userService.updateUser({ where: { id: req.user.id }, data: { banner: res } });
            return { message: 'Banner updated' };
        } catch (err) {
            throw new UnsupportedMediaTypeException();
        }
    }

    @UseGuards(JwtGuard)
    @Post('settings/delete-banner')
    async updateSettingsDeleteBanner(@Req() req) {
        await this.userService.updateUser({ where: { id: req.user.id }, data: { banner: "https://dslv9ilpbe7p1.cloudfront.net/6P2tJV-6qxBDs2T8q21wZg_store_banner_image.jpeg" } });
        return { message: 'Banner deleted' };
    }

    @UseGuards(JwtGuard)
    @Post('addFriend')
    @FormDataRequest()
    async addFriend(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        if (user.id === friend.id)
            throw new HttpException('Cannot friend yourself', 400);
        if (await this.userService.isFriend(user.id, friend.id))
            throw new HttpException('Already friends', 400);
        if (await this.userService.isFriendRequest(friend.id, user.id))
            throw new HttpException('Already sent a friend request', 200);
        if (await this.userService.isBlocked(user.id, friend.id))
            throw new HttpException('You have blocked this user', 400);
        if (await this.userService.isBlocked(friend.id, user.id))
            throw new HttpException('You are blocked by this user', 400);
        await this.userService.addFriendRequest(friend.id, user.id);
    }

    @UseGuards(JwtGuard)
    @Post('removeFriend')
    @FormDataRequest()
    async removeFriend(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        if (!await this.userService.isFriend(user.id, friend.id))
            throw new HttpException('Not friends', 400);
        await this.userService.deleteFriend(user.id, friend.id);
    }

    @UseGuards(JwtGuard)
    @Post('acceptFriend')
    @FormDataRequest()
    async acceptFriend(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        const isFriendRequest = await this.userService.isFriendRequest(user.id, friend.id);
        if (!isFriendRequest)
            throw new HttpException('No friend request', 400);
        await this.userService.acceptFriendRequest(user.id, friend.id);
    }

    @UseGuards(JwtGuard)
    @Post('rejectFriend')
    @FormDataRequest()
    async rejectFriend(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        const isFriendRequest = await this.userService.isFriendRequest(user.id, friend.id);
        if (!isFriendRequest)
        throw new HttpException('No friend request', 400);
        await this.userService.rejectFriendRequest(user.id, friend.id);
    }

    @UseGuards(JwtGuard)
    @Post('blockUser')
    @FormDataRequest()
    async blockUser(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        if (await this.userService.isBlocked(user.id, friend.id))
            throw new HttpException('Already blocked', 400);
        await this.userService.deleteFriend(user.id, friend.id);
        await this.userService.addBlocked(user.id, friend.id);
    }

    @UseGuards(JwtGuard)
    @Post('unblockUser')
    @FormDataRequest()
    async unblockUser(@Req() req, @Body() body: AddFriendDTO) {
        const user = await this.userService.user({ id: req.user.id });
        const friend = await this.userService.user({ id: body.id });
        if (!user || !friend)
            throw new HttpException('User not found', 404);
        if (!await this.userService.isBlocked(user.id, friend.id))
            throw new HttpException('Not blocked', 400);
        await this.userService.deleteBlocked(user.id, friend.id);
    }

	@UseGuards(JwtGuard)
    @Get('search/:username')
    async userSearch(@Req() req, @Param() params: UserSearchDTO) {
		const users = await this.userService.users({
            take: 5,
            where: { 
                username: { contains: params.username, mode: "insensitive" },
            },
        });

        // Sort the users by the first occurence of the search query
        users.sort((a, b) => {
            return a.username.indexOf(params.username) - b.username.indexOf(params.username);
        });

        const usersProfiles = await Promise.all(
			users.map(async (user) => {
				return await this.userService.getProfileMicro({ id: user.id });
			}),
		);

		return usersProfiles;
	}
}
