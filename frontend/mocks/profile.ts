import { Achievement, Match, User } from "@/types/profile";

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
	friends: [],
	history: [],
	achievements: [],
	activity: activities,
	two_factor: false,
	friend_requests: [],
	blocked_users: [],
	createdAt: new Date(),
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

export const achievements: Achievement[] = [
	{
		id: 1,
		name: "Ace Master",
		description:
			"Awarded for achieving a certain number of aces in a single match or over multiple matches.",
		icon: "/ace_master_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 2,
		name: "Unbeatable",
		description:
			"Awarded for maintaining a winning streak of a certain number of consecutive matches.",
		icon: "/unbeatable_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 3,
		name: "Iron Paddle",
		description:
			"Awarded for playing a certain number of matches without losing a single point.",
		icon: "/iron_paddle_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 4,
		name: "Quick Reflexes",
		description:
			"Awarded for successfully returning a certain number of fast-paced shots within a short time frame.",
		icon: "/quick_reflexes_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 5,
		name: "Spin Wizard",
		description:
			"Awarded for consistently using spin shots effectively throughout matches.",
		icon: "/spin_wizard_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 6,
		name: "Precision Player",
		description:
			"Awarded for hitting a certain percentage of shots within a designated target area on the opponent's side of the table.",
		icon: "/precision_player_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 7,
		name: "Comeback King/Queen",
		description:
			"Awarded for winning a match after being down by a certain number of points.",
		icon: "/comeback_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 8,
		name: "Rally Maestro",
		description:
			"Awarded for participating in a rally that lasts for a certain number of hits.",
		icon: "/rally_maestro_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 9,
		name: "Power Player",
		description:
			"Awarded for hitting the ball above a certain speed threshold in a match.",
		icon: "/power_player_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
	{
		id: 10,
		name: "Tournament Champion",
		description:
			"Awarded for winning a specific tournament or series of tournaments.",
		icon: "/tournament_champion_icon.png",
		date: new Date("2024-04-27T00:00:00.000Z"),
		score: 100,
	},
];

export const friends: any[] = Array.from({ length: 10 }).map((_, i) => ({
	...(i % 2 == 0 ? user1 : user2),
	friends: [],
}));

// user1.history = history;
// user1.achievements = achievements;
// user1.friends = friends;

// user2.history = history;
// user2.achievements = achievements;
// user2.friends = friends;

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
	friends: [],
	history: [],
	achievements: [],
	activity: [],
	two_factor: false,
	friend_requests: [],
	blocked_users: [],
	createdAt: new Date(),
};
