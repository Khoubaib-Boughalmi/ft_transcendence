import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type Achievement = {
	id: number;
	name: string;
	description: string;
	icon: string;
	date: Date;
	score: number;
};

export type UserProfile = {
	id: string;
	username: string;
	email: string;
	createdAt: Date;
	avatar: string;
	banner: string;
	country: string;
	level: number;
	level_percentage: number;
	rank: number;
	division: string;
	achievements: Achievement[];
	achievements_percentage: number;
};

export type UserProfileMicro = UserProfile;

export type UserProfileMini = UserProfile & {
	wins: number;
	losses: number;
	matches: number;
	friends: UserProfileMicro[];
};

export type UserProfileFull = UserProfileMini & {
	two_factor: boolean;
	friend_requests: UserProfileMicro[];
	blocked_users: UserProfileMicro[];
};
@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async user(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: userWhereUniqueInput,
		});
	}

	async users(
		params: {
			take?: number;
			where?: Prisma.UserWhereInput;
		} = {},
	): Promise<User[]> {
		const { take, where } = params;
		return this.prisma.user.findMany({
			take,
			where,
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

	async getMatchesInfo(user: User): Promise<any> {
		// Find matches with ids in user.history
		const matches = await this.prisma.gameMatch.findMany({
			where: {
				id: {
					in: user.history,
				},
			},
		});
		return {
			matches: matches.length,
			wins: matches.filter((match) => match.winner_id === user.id).length,
			losses: matches.filter((match) => match.winner_id !== user.id)
				.length,
		};
	}

	getProfileBase(user: User): UserProfileMicro {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			createdAt: user.created_at,
			avatar: user.avatar,
			banner: user.banner,
			country: user.country,
			level: user.level,
			level_percentage: (user.level_exp * 100) / 1000,
			rank: user.rank,
			division: user.division,
			achievements: [],
			achievements_percentage: 0,
		};
	}

	async getProfileFull(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<UserProfileFull | null> {
		const user = await this.user(userWhereUniqueInput);
		if (!user) return null;
		return {
			...this.getProfileBase(user),
			...(await this.getMatchesInfo(user)),
			two_factor: user.two_factor,
			friends: await this.getFriends(user.id),
			friend_requests: await this.getFriendRequests(user.id),
			blocked_users: await this.getBlockedUsers(user.id),
		};
	}

	async getProfileMini(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<UserProfileMini | null> {
		const user = await this.user(userWhereUniqueInput);
		if (!user) return null;
		return {
			...this.getProfileBase(user),
			...(await this.getMatchesInfo(user)),
			friends: await this.getFriends(user.id),
		};
	}

	async getProfileMicro(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<UserProfileMicro | null> {
		const user = await this.user(userWhereUniqueInput);
		if (!user) return null;
		return this.getProfileBase(user);
	}

	async getMicroProfiles(user_ids: string[]): Promise<UserProfileMicro[]> {
		const users = await this.prisma.user.findMany({
			where: {
				id: {
					in: user_ids,
				},
			},
		});
		return users.map((user) => this.getProfileBase(user));
	}

	async gainExp(id: string, exp: number): Promise<void> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});
		if (!user) return;

		const newExp = user.level_exp + exp;
		const updateData =
			newExp < 1000
				? { level_exp: newExp }
				: { level: user.level + 1, level_exp: newExp - 1000 };

		await this.prisma.user.update({
			where: { id },
			data: updateData,
		});
	}

	async addFriendRequest(user_id: string, friend_id: string): Promise<void> {
		await this.createRelationship(
			user_id,
			friend_id,
			this.prisma.friendRequests,
			false,
		);
	}

	async acceptFriendRequest(
		user_id: string,
		friend_id: string,
	): Promise<void> {
		await this.deleteFriendRequest(user_id, friend_id);
		await this.addFriend(user_id, friend_id);
	}

	async rejectFriendRequest(
		user_id: string,
		friend_id: string,
	): Promise<void> {
		await this.deleteRelationship(
			user_id,
			friend_id,
			this.prisma.friendRequests,
			false,
		);
	}

	async deleteFriendRequest(
		user_id: string,
		friend_id: string,
	): Promise<void> {
		await this.deleteRelationship(
			user_id,
			friend_id,
			this.prisma.friendRequests,
			true,
		);
	}

	async addFriend(user_id: string, friend_id: string): Promise<void> {
		await this.createRelationship(
			user_id,
			friend_id,
			this.prisma.friends,
			true,
		);
	}

	async deleteFriend(user_id: string, friend_id: string): Promise<void> {
		await this.deleteRelationship(
			user_id,
			friend_id,
			this.prisma.friends,
			true,
		);
	}

	async addBlocked(user_id: string, friend_id: string): Promise<void> {
		await this.createRelationship(
			user_id,
			friend_id,
			this.prisma.blockedUsers,
			false,
		);
	}

	async deleteBlocked(user_id: string, friend_id: string): Promise<void> {
		await this.deleteRelationship(
			user_id,
			friend_id,
			this.prisma.blockedUsers,
			false,
		);
	}

	private async createRelationship(
		user_id: string,
		friend_id: string,
		model: any,
		isTwoWay: boolean,
	): Promise<void> {
		await model.create({
			data: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});

		if (isTwoWay) {
			await model.create({
				data: {
					user1_id: friend_id,
					user2_id: user_id,
				},
			});
		}
	}

	private async deleteRelationship(
		user_id: string,
		friend_id: string,
		model: any,
		isTwoWay: boolean,
	): Promise<void> {
		await model.deleteMany({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});

		if (isTwoWay) {
			await model.deleteMany({
				where: {
					user1_id: friend_id,
					user2_id: user_id,
				},
			});
		}
	}

	async isFriendRequest(
		user_id: string,
		friend_id: string,
	): Promise<boolean> {
		return this.isRelationship(
			user_id,
			friend_id,
			this.prisma.friendRequests,
		);
	}

	async isFriend(user_id: string, friend_id: string): Promise<boolean> {
		return this.isRelationship(user_id, friend_id, this.prisma.friends);
	}

	async isBlocked(user_id: string, friend_id: string): Promise<boolean> {
		return this.isRelationship(
			user_id,
			friend_id,
			this.prisma.blockedUsers,
		);
	}

	private async isRelationship(
		user_id: string,
		friend_id: string,
		model: any,
	): Promise<boolean> {
		const friend = await model.findFirst({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});

		return friend ? true : false;
	}

	async getFriends(user_id: string): Promise<UserProfileMicro[]> {
		return this.getRelatedUsers(user_id, this.prisma.friends);
	}

	async getFriendRequests(user_id: string): Promise<UserProfileMicro[]> {
		return this.getRelatedUsers(user_id, this.prisma.friendRequests);
	}

	async getBlockedUsers(user_id: string): Promise<UserProfileMicro[]> {
		return this.getRelatedUsers(user_id, this.prisma.blockedUsers);
	}

	private async getRelatedUsers(
		user_id: string,
		model: any,
	): Promise<UserProfileMicro[]> {
		const friends = await model.findMany({
			where: {
				user1_id: user_id,
			},
		});

		const friendsProfiles = await Promise.all(
			friends.map(async (friend) => {
				return await this.getProfileMicro({ id: friend.user2_id });
			}),
		);
		return friendsProfiles;
	}
}
