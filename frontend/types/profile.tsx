"use client";
export type Rank = {
	name: string;
	color: "bronze" | "silver" | "gold" | "platinum" | "diamond";
};
export type MatchType = "Classic" | "Power";
export type MatchLeague = "Casual" | "Ranked" | "Tournament";
export type Achievement = {
	id: number;
	name: string;
	description: string;
	icon: string;
	date: Date;
	score: number;
};
export type Match = {
	id: number;
	user1: User;
	user2: User;
	result: "win" | "lose" | "tie";
	duration: number;
	date: Date;
	type: MatchType;
	league: MatchLeague;
	map: string;
	score1: number;
	score2: number;
};

export type User = {
	id: string;
	username: string;
	avatar: string;
	banner: string;
	country: string;
	level: number;
	level_percentage: number;
	achievements: Achievement[];
	achievements_percentage: number;
	history: Match[];
	wins: number;
	losses: number;
	matches: number;
	rank: number;
	division: string;
	activity: number[];
	friends: User[];
	friend_requests: User[];
	blocked_users: User[];
	two_factor: boolean;
};
export type InteractionType =
	| "add"
	| "accept"
	| "reject"
	| "block"
	| "unblock"
	| "unfriend";
