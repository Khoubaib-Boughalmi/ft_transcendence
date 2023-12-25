import { Rank, User, Match, Achievement, StatusType } from "@/types/profile";
import axios from "@/lib/axios";
import { useContext } from "react";
import PublicContext from "@/contexts/PublicContext";
import toast from "react-hot-toast";

export function getFlag(country: string) {
	const FLAGS: {
		[key: string]: string;
	} = {
		Morocco: "🇲🇦",
		China: "🇨🇳",
	};

	return FLAGS[country] ?? "🏳️‍🌈";
}

export function getRank(rank: number) {
	const RANKS: Rank[] = [
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

	return RANKS[rank] ?? RANKS[0];
}

export function makeForm(data: any) {
	const formData = new FormData();
	Object.keys(data).forEach((key) => formData.append(key, data[key]));
	return formData;
}

export async function fetcher<T>(url: string) {
	try {
		const res = await axios.get<T>(url);
		return res.data;
	} catch (err) {
		return null;
	}
}

export async function fetcherUnsafe<T>(url: string) {
	return axios.get<T>(url).then((res) => res.data);
}

export async function useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
	endpoint: string,
	data?: any,
	setLoading?: (loading: boolean) => void,
	success?: string,
	error?: string,
	mutation?: () => Promise<void>
) {
	try {
		if (setLoading) setLoading(true);
		const res = await axios.post(endpoint, data);
		mutation && await mutation()
		success && toast.success(success);
	} catch (err) {
		error && toast.error(error);
	}
	if (setLoading) setLoading(false);
}
