import ChatContext from "@/contexts/ChatContext";
import ContextMenuContext from "@/contexts/ContextMenuContext";
import axios from "@/lib/axios";
import { ChatContextType } from "@/types/chat";
import { InteractionType, Rank, User } from "@/types/profile";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";

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
	Object.keys(data).forEach(
		(key) => data[key] != undefined && formData.append(key, data[key]),
	);
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

export async function AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
	endpoint: string,
	data?: any,
	setLoading?: (loading: boolean) => void,
	success?: string,
	error?: string,
	mutation?: () => Promise<void>,
) {
	try {
		if (setLoading) setLoading(true);
		const res = await axios.post(endpoint, data);
		mutation && (await mutation());
		success && toast.success(success);
	} catch (err) {
		error && toast.error(error);
	}
	if (setLoading) setLoading(false);
}
export const interactionDictionary = {
	add: [
		"Add Friend",
		"Friend Request Sent",
		"Failed to Send Friend Request",
		"/user/addFriend",
	],
	unfriend: [
		"Unfriend",
		"User Unfriended",
		"Failed to Unfriend User",
		"/user/removeFriend",
	],
	accept: [
		"Accept",
		"Request Accepted",
		"Failed to Accept Request",
		"/user/acceptFriend",
	],
	reject: [
		"Reject",
		"Request Rejected",
		"Failed to Reject Request",
		"/user/rejectFriend",
	],
	block: ["Block", "User Blocked", "Failed to Block User", "/user/blockUser"],
	unblock: [
		"Unblock",
		"User Unblocked",
		"Failed to Unblock User",
		"/user/unblockUser",
	],
};

export async function InteractionFunctionality(
	type: InteractionType,
	user: User,
	sessionMutate: any,
	setLoading?: any,
) {
	const [buttonText, successText, errorText, endpointURL] =
		interactionDictionary[type];

	AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
		endpointURL,
		makeForm({ id: user.id }),
		setLoading,
		successText,
		errorText,
		async () => {
			await sessionMutate();
			await mutate(`/chat/channel/list`);
		}
	);
}

export function useIsOnline(userId: string | null, setOnlineStates: any = null) {
	const { data } = useSWR(userId ? `/user/profile/isonline/${userId}` : null, fetcher, {
		refreshInterval: 10000,
	}) as any;

	useEffect(() => {
		if (!setOnlineStates || !userId) return;
		setOnlineStates((prev: any) => {
			const prevOnline = prev[userId];
			const newOnline = data ? data.isOnline : false;
			if (prevOnline === newOnline) return prev;
			const newMap = new Map(prev);
			newMap.set(userId, newOnline);
			return newMap;
		})
		
	}, [userId, data, setOnlineStates]);

	return data ? data.isOnline : false;
}

export function randomString() {
	return Math.random().toString(36).substring(7);
}

export function useChatContext() {
	return useContext(ChatContext) as ChatContextType;
}
export function useServerList() {
	const {
		data: servers,
		mutate: serversMutate,
		isLoading: serversLoading,
	} = useSWR("/chat/channel/list", fetcher) as any;
	const prevServers = useRef(null) as any;
	return { servers, serversMutate, prevServers, serversLoading };
}

export function useContextMenu(): {
	setContextMenu: (contextMenu: React.ReactNode) => void;
	setMaterializePosition: (position: { x: number; y: number } | null) => void;
	materializePosition: { x: number; y: number };
	closeMenu: () => void;
} {
	return useContext(ContextMenuContext) as any;
}

export function useServerId(pathname: string) {
	const isChat = pathname.includes("/channel");
	const selectedServerId = isChat ? pathname.split("/").pop()?.trim() : null;
	return selectedServerId ?? null;
}
