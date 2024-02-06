import { User, Match, Achievement } from "@/types/profile";

const activities = [100, 0, 5, 10, 15, 20, 0, 0, 0, 0, 12, 18];

export const user1: User = {
	id: "1",
	username: "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
	avatar: "/pfp.png",
	banner: "/background2.png",
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
};

export const user2: User = {
	...user1,
	id: "2",
	username: "mrian",
	avatar: "/mrian.jpeg",
	banner: "/background2.png",
	country: "China",
	rank: 3,
	division: "II",
};

const history: Match[] = Array.from({ length: 30 }).map((_, i) => ({
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

const achievements: Achievement[] = Array.from({ length: 30 }).map((_, i) => ({
	id: i,
	name: "Achievement " + i,
	description:
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.",
	icon: "/pfp.png",
	date: new Date(),
	score: 100,
}));

const friends: any[] = Array.from({ length: 10 })
	.map((_, i) => ({
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
	avatar: "/placeholder.png",
	banner: "/placeholder.png",
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
};