import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async user(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: userWhereUniqueInput,
		});
	}

	async createUser(data: Prisma.UserCreateInput): Promise<User> {
		return this.prisma.user.create({
			data,
		});
	}

	async updateUser(params: {
		where: Prisma.UserWhereUniqueInput;
		data: Prisma.UserUpdateInput;
	}): Promise<User> {
		const { where, data } = params;
		return this.prisma.user.update({
			data,
			where,
		});
	}

	async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
		return this.prisma.user.delete({
			where,
		});
	}

	async getUniqueName(username: string): Promise<string> {
		const user = await this.user({ username });
		if (!user) return username;
		let i = 1;
		while (true) {
			const newUsername = username + i;
			const newUser = await this.user({ username: newUsername });
			if (!newUser) return newUsername;
			i++;
		}
	}

	async getProfileFull(username: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { username },
		});
	}

	async getProfileMini(username: string): Promise<User | null> {
		const user = this.getProfileFull(username);
		return user;
	}

	async getProfileMicro(username: string): Promise<User | null> {
		const user = this.getProfileFull(username);
		return user;
	}
}
