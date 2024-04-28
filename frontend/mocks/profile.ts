import { Achievement, Match, User } from "@/types/profile";
import axios from 'axios';

const activities = [100, 0, 5, 10, 15, 20, 0, 0, 0, 0, 12, 18];

export const user1: User = {
	id: "1",
	username: "mmmmmm",
	avatar: "/transparent_placeholder.png",
	banner: "/transparent_placeholder.png",
	country: "Morocco",
	level: 1,
	level_percentage: 0,
	wins: 0,
	losses: 0,
	matches: 0,
	achievements_percentage: 0,
	rank: 0,
	division: "I",
	division_exp: 0,
	friends: [],
	history: [],
	achievements: [],
	activity: activities,
	two_factor: false,
	friend_requests: [],
	blocked_users: [],
	createdAt: new Date()
};

export const user2: User = {
	...user1,
	id: "2",
	username: "mrian",
	avatar: "/transparent_placeholder.png",
	banner: "/transparent_placeholder.png",
	country: "China",
	rank: 3,
	division: "II",
};

export const history: Match[] = Array.from({ length: 30 }).map((_, i) => ({
	id: i,
	user1: user1,
	user2: user2,
	result: ["win", "lose", "tie"][i % 3] as any,
	duration: 300,
	date: new Date(),
	type: "Classic",
	league: "Ranked",
	map: "The Arena",
	score1: 5,
	score2: 0,
}));


export const achievementsList: Achievement[] = [
	{
		id: 1,
		name: "Welcome to the Club!",
		description:
			"Awarded for playing your first match.",
		icon: "/achievements/beg.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 2,
		name: "Unbeatable",
		description:
			"Awarded for maintaining a winning streak of Three matches.",
		icon: "/achievements/ws3.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 3,
		name: "Iron Paddle",
		description:
			"Awarded for playing three matches.",
		icon: "/achievements/p3m.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 4,
		name: "Dominating Victory",
		description:
			"Awarded for winning a match with a margin of at least 5 points.",
		icon: "/achievements/w5d.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 5,
		name: "Win Master",
		description:
			"Awarded for maintaining a winning streak of Five matches.",
		icon: "/achievements/ws5.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 6,
		name: "Unstoppable Player",
		description:
			"Awarded for maintaining a winning streak of Ten matches.",
		icon: "/achievements/ws10.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 7,
		name: "King/Queen",
		description:
			"Awarded for maintaining a winning streak of hundred matches.",
		icon: "/achievements/ws100.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 8,
		name: "Maestro",
		description:
			"Awarded for playing hundred matches.",
		icon: "/achievements/p100m.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 9,
		name: "Power Player",
		description:
			"Awarded for playing Five matches.",
		icon: "/achievements/p5m.jpg",
		date: new Date(),
		score: 100,
	},
	{
		id: 10,
		name: "Champion",
		description:
			"Awarded for playing Ten matches.",
		icon: "/achievements/p10m.jpg",
		date: new Date(),
		score: 100,
	},
];

export const friends: any[] = Array.from({ length: 10 }).map((_, i) => ({
	...(i % 2 == 0 ? user1 : user2),
	friends: [],
}));

export const dummyUser: User = {
	id: "1",
	username: "",
	avatar: "/transparent_placeholder.png",
	banner: "/transparent_placeholder.png",
	country: "",
	level: 1,
	level_percentage: 0,
	wins: 0,
	losses: 0,
	matches: 0,
	achievements_percentage: 0,
	rank: 0,
	division: "I",
	division_exp: 0,
	friends: [],
	history: [],
	achievements: [],
	activity: [],
	two_factor: false,
	friend_requests: [],
	blocked_users: [],
	createdAt: new Date()
};
