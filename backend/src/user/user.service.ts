import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';

export type UserProfileFull = {
	id: string;
	username: string;
	email: string;
	createdAt: Date;
	avatar: string;
	banner: string;
	country: string;
	level: number;
	level_percentage: number;
	wins: number;
	losses: number;
	matches: number;
	rank: number;
	division: string;
	two_factor: boolean;
};

// a type which is a subset of UserProfileFull
export type UserProfileMini = {
	id: string;
	username: string;
	email: string;
	createdAt: Date;
	avatar: string;
	banner: string;
	country: string;
	level: number;
	level_percentage: number;
	wins: number;
	losses: number;
	matches: number;
	rank: number;
	division: string;
};

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

	async isRelationExists(
		user_id: string,
		friend_id: string,
		relation: 'friends' | 'blocked',
	): Promise<boolean> {
		const relationExists = await this.prisma.user.findUnique({
			where: { id: user_id },
			include: {
				[relation]: {
					where: {
						id: friend_id,
					},
				},
			},
		});
		return !!relationExists;
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

	async getProfileFull(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<UserProfileFull | null> {
		const user = await this.user(userWhereUniqueInput);
		if (!user) return null;
		// Find matches with ids in user.history
		const matches = await this.prisma.gameMatch.findMany({
			where: {
				id: {
					in: user.history,
				},
			},
		});
		const total_matches = matches.length;
		const matches_won = matches.filter((match) => match.winner_id === user.id).length
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			createdAt: user.created_at,
			avatar: user.avatar,
			banner: user.banner,
			country: user.country,
			level: user.level,
			level_percentage: user.level_exp * 100 / 1000,
			matches: matches.length,
			wins: matches.filter((match) => match.winner_id === user.id).length,
			losses: matches.filter((match) => match.winner_id !== user.id).length,
			rank: user.rank,
			division: user.division,
			two_factor: user.two_factor,
		};
	}

	async getProfileMini(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<UserProfileMini | null> {
		const user = await this.getProfileFull(userWhereUniqueInput);
		if (!user) return null;
		const { two_factor, ...rest } = user;
		return {
			...rest,
		}
	}

	async getProfileMicro(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<UserProfileMini | null> {
		const user = await this.getProfileFull(userWhereUniqueInput);
		if (!user) return null;
		const { two_factor, ...rest } = user;
		return {
			...rest,
		}
	}

	async gainExp(id: string, exp: number): Promise<void> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});
		if (!user) return;

		const newExp = user.level_exp + exp;
		const updateData = newExp < 1000
			? { level_exp: newExp }
			: { level: user.level + 1, level_exp: newExp - 1000 };

		await this.prisma.user.update({
			where: { id },
			data: updateData,
		});
	}

	async addFriend(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.user.update({
			where: { id: user_id },
			data: {
				friends: {
					connect: {
						id: friend_id,
					},
				},
			},
		});
	}
}
