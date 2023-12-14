import { Rank, User, Match, Achievement, Status } from "@/types/profile";

export function getFlag(country: string) {
	const FLAGS: {
		[key: string]: string;
	} = {
		Morocco: "🇲🇦",
		China: "🇨🇳",
	};

	return FLAGS[country] ?? "🏳️‍🌈";
}

export const RANKS: Rank[] = [
	{
		name: "D",
		color: "bronze",
	},
	{
		name: "C",
		color: "silver",
	},
	{
		name: "B",
		color: "gold",
	},
	{
		name: "A",
		color: "platinum",
	},
	{
		name: "S",
		color: "diamond",
	},
];