import { Body, Controller, Get, Param, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { IsLowercase, IsOptional, Length } from 'class-validator';
import { JwtGuard } from 'src/auth/auth.guards';

export class ProfileDTO {
    @IsLowercase()
    @Length(1, 36)
    @IsOptional()
    username: string;
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
}
