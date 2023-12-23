import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';

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
	wins: number;
	losses: number;
	matches: number;
	rank: number;
	division: string;
};

export type UserProfileMicro = UserProfile;

export type UserProfileMini = UserProfile & {
	friends: UserProfileMini[];
};

export type UserProfileFull = UserProfileMini & {
	two_factor: boolean;
	friend_requests: UserProfileMini[];
	blocked_users: UserProfileMini[];
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
			friends: await this.getFriends(user.id),
			friend_requests: await this.getFriendRequests(user.id),
			blocked_users: await this.getBlockedUsers(user.id),
		};
	}

	async getProfileMini(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<UserProfileMini | null> {
		const user = await this.getProfileFull(userWhereUniqueInput);
		if (!user) return null;
		const { two_factor, friend_requests, blocked_users, ...rest } = user;
		return {
			...rest,
		}
	}

	async getProfileMicro(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<UserProfileMicro | null> {
		const user = await this.getProfileMini(userWhereUniqueInput);
		if (!user) return null;
		const { friends, ...rest } = user;
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

	async addFriendRequest(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.friendRequests.create({
			data: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
	}

	async acceptFriendRequest(user_id: string, friend_id: string): Promise<void> {
		await this.deleteFriendRequest(user_id, friend_id);
		await this.deleteFriendRequest(friend_id, user_id);
		await this.addFriend(user_id, friend_id);
		await this.addFriend(friend_id, user_id);
	}

	async deleteFriendRequest(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.friendRequests.deleteMany({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
	}

	async addFriend(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.friends.create({
			data: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
		await this.prisma.friends.create({
			data: {
				user1_id: friend_id,
				user2_id: user_id,
			},
		});
	}

	async deleteFriend(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.friends.deleteMany({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
		await this.prisma.friends.deleteMany({
			where: {
				user1_id: friend_id,
				user2_id: user_id,
			},
		});
	}

	async addBlocked(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.blockedUsers.create({
			data: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
	}

	async deleteBlocked(user_id: string, friend_id: string): Promise<void> {
		await this.prisma.blockedUsers.deleteMany({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
	}

	async isFriendRequest(user_id: string, friend_id: string): Promise<boolean> {
		const friend = await this.prisma.friendRequests.findFirst({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
		return friend ? true : false;
	}

	async isFriend(user_id: string, friend_id: string): Promise<boolean> {
		const friend = await this.prisma.friends.findFirst({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
		return friend ? true : false;
	}
	
	async isBlocked(user_id: string, friend_id: string): Promise<boolean> {
		const friend = await this.prisma.blockedUsers.findFirst({
			where: {
				user1_id: user_id,
				user2_id: friend_id,
			},
		});
		return friend ? true : false;
	}

	async getFriends(user_id: string): Promise<UserProfileMicro[]> {
		const friends = await this.prisma.friends.findMany({
			where: {
				user1_id: user_id,
			},
		});
		const friendsProfiles = await Promise.all(friends.map(async (friend) => {
			return await this.getProfileMicro({ id: friend.user2_id });
		}));
		return friendsProfiles;
	}

	async getFriendRequests(user_id: string): Promise<UserProfileMicro[]> {
		const friends = await this.prisma.friendRequests.findMany({
			where: {
				user2_id: user_id,
			},
		});
		const friendsProfiles = await Promise.all(friends.map(async (friend) => {
			return await this.getProfileMicro({ id: friend.user1_id });
		}));
		return friendsProfiles;
	}

	async getBlockedUsers(user_id: string): Promise<UserProfileMicro[]> {
		const friends = await this.prisma.blockedUsers.findMany({
			where: {
				user1_id: user_id,
			},
		});
		const friendsProfiles = await Promise.all(friends.map(async (friend) => {
			return await this.getProfileMicro({ id: friend.user2_id });
		}));
		return friendsProfiles;
	}
}
