"use client";
import LoadingSection from "@/components/LoadingSection";
import SectionContainer from "@/components/SectionContainer";
import ServerList from "@/components/ServerList";
import ChatContext from "@/contexts/ChatContext";
import PublicContext from "@/contexts/PublicContext";
import socket from "@/lib/socket";
import { randomString, useServerId } from "@/lib/utils";
import { fetcherUnsafe, useChatContext, useServerList } from "@/lib/utils";
import { Message, Server } from "@/types/chat";
import { User } from "@/types/profile";
import { usePathname, useRouter } from "next/navigation";
import {
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

function ChatSection({ children }: { children: ReactNode }) {
	const { selectedServer, expanded, setExpanded } = useChatContext();

	return (
		<SectionContainer>
			{expanded && (
				<div
					onClick={() => setExpanded(false)}
					className="absolute inset-0 z-10"
				></div>
			)}
			{children}
		</SectionContainer>
	);
}

function useSelectedServer(servers: Server[]) {
	const pathname = usePathname();
	const selectedServerId = useServerId(pathname);
	const selectedServer = servers?.find(
		(server: Server) => server.id == selectedServerId,
	);
	const prevSelectedServerId = useRef(selectedServerId);
	return { selectedServerId, selectedServer, prevSelectedServerId };
}

function useSelectedServerMessages(
	selectedServerId: string | null,
	setAkashicRecords: any,
) {
	const { session, sessionLoading } = useContext(PublicContext) as any;

	const {
		data: selectedServerMessages,
		isLoading: selectedServerMessagesLoading,
		mutate: selectedServerMessagesMutate,
		isValidating: selectedServerMessagesValidating,
	} = useSWR(
		selectedServerId && !sessionLoading
			? `/chat/channel/messages/${selectedServerId}`
			: null,
		fetcherUnsafe,
		{
			onSuccess: (data) => {
				console.log({ selectedServerId, session });
				if (selectedServerId)
					setAkashicRecords((prev: any) => ({
						...prev,
						[selectedServerId]: ((data as any) || []).map(
							(message: Message) => {
								message.blocked = session.blocked_users.some(
									(user: User) => {
										return user.id == message.user.id;
									},
								);
								message.loaded = true;
								return message;
							},
						),
					}));
			},
		},
	) as any;

	return {
		selectedServerMessages,
		selectedServerMessagesLoading,
		selectedServerMessagesMutate,
		selectedServerMessagesValidating,
	};
}

function useSelectedServerData(selectedServerId: string | null) {
	const {
		data: selectedServerData,
		isLoading: selectedServerDataLoading,
		mutate: selectedServerDataMutate,
	} = useSWR(
		selectedServerId ? `/chat/channel/members/${selectedServerId}` : null,
		fetcherUnsafe,
	) as any;

	// Sort the members list so that the owner is always first, then the admins, then the rest of the members in alphabetical order
	const sortedMembersList = selectedServerData?.members?.sort(
		(a: User, b: User) => {
			if (a.id == selectedServerData?.owner?.id) return -1;
			if (b.id == selectedServerData?.owner?.id) return 1;
			if (
				selectedServerData?.admins?.find(
					(admin: User) => admin?.id == a.id,
				)
			)
				return -1;
			if (
				selectedServerData?.admins?.find(
					(admin: User) => admin?.id == b.id,
				)
			)
				return 1;
			return a.username.localeCompare(b.username);
		},
	);

	return {
		selectedServerData,
		selectedServerDataLoading,
		selectedServerDataMutate,
		selectedServerMembers: sortedMembersList || [],
		selectedServerInvites: selectedServerData?.invites || [],
		selectedServerBans: selectedServerData?.bans || [],
		selectedServerAdmins: selectedServerData?.admins || [],
	};
}

function useSelectedServerMessagesFixer(
	selectedServerMessages: Message[],
	messageParents: any,
) {
	const messages = [...(selectedServerMessages || [])];

	messageParents.current = {};
	for (let i = 0; i < messages.length; i++) {
		const newGroup = randomString();
		messages[i].groupid = newGroup;
	}

	for (let i = 0; i < messages.length; i++) {
		if (messages[i].user.id == messages[i + 1]?.user.id) {
			messages[i].noAvatar = true;
		}
		messages[i].parent = true;
		if (messageParents.current[messages[i].groupid] == undefined)
			messageParents.current[messages[i].groupid] = 1;
		if (messages[i + 1]?.blocked == messages[i]?.blocked)
			messages[i].parent = false;
		if (i > 0 && messages[i].blocked == messages[i - 1].blocked) {
			messageParents.current[messages[i - 1].groupid] += 1;
			messages[i].groupid = messages[i - 1].groupid;
		}
	}

	return messages;
}

export default function Page({
	children,
	params,
}: {
	children: ReactNode;
	params: any;
}) {
	const router = useRouter();

	const {
		session,
		expecting,
		setExpecting,
		setNotifications,
		sessionLoading,
	} = useContext(PublicContext) as any;
	const { servers, serversMutate, prevServers } = useServerList();
	const [timesNavigated, setTimesNavigated] = useState(0);

	const [listTab, setListTab] = useState<"servers" | "friends">("servers");
	const [showMembers, setShowMembers] = useState(true);
	const [expanded, setExpanded] = useState(false);

	const { selectedServerId, selectedServer, prevSelectedServerId } =
		useSelectedServer(servers);

	const [akashicRecords, setAkashicRecords] = useState<{
		[key: string]: Message[];
	}>({});

	const {
		selectedServerMessages,
		selectedServerMessagesLoading,
		selectedServerMessagesMutate,
		selectedServerMessagesValidating,
	} = useSelectedServerMessages(selectedServerId, setAkashicRecords);

	const {
		selectedServerDataLoading,
		selectedServerDataMutate,
		selectedServerMembers,
		selectedServerInvites,
		selectedServerBans,
		selectedServerAdmins,
	} = useSelectedServerData(selectedServerId);

	const [displayedMessages, setDisplayedMessages] = useState({});
	const prevDisplayedMessages = useRef(displayedMessages);

	const messageParents = useRef({}) as any;
	const loadingSectionVisible =
		(expecting && !selectedServerId) ||
		sessionLoading ||
		selectedServerMessagesLoading ||
		selectedServerDataLoading ||
		!akashicRecords;

	console.log(
		{loadingSectionVisible, expecting, selectedServerId}
	)

	const fixedSelectedServerMessages = useSelectedServerMessagesFixer(
		selectedServerId
			? akashicRecords[selectedServerId] || selectedServerMessages
			: [],
		messageParents,
	);

	const prevSelectedServerMessages = useRef(selectedServerMessages);

	useEffect(() => {
		if (fixedSelectedServerMessages) {
			prevSelectedServerMessages.current = fixedSelectedServerMessages;
		}
	}, [akashicRecords, fixedSelectedServerMessages]);

	const serverMutate = useCallback(async () => {
		await Promise.all([
			serversMutate(),
			selectedServerMessagesMutate(),
			selectedServerDataMutate(),
		]);
	}, [selectedServerDataMutate, selectedServerMessagesMutate, serversMutate]);

	const navigateToServer = useCallback(
		(serverId: string) => {
			setTimesNavigated((prev) => prev + 1);
			router.push(`/chat/channel/${serverId}`);
		},
		[router],
	);

	useEffect(() => {
		if (prevServers.current != null) {
			const serversInServersButNotInPrevServers = servers?.filter(
				(server: Server) =>
					!prevServers.current?.find(
						(prevServer: Server) => prevServer.id == server.id,
					),
			);

			if (serversInServersButNotInPrevServers?.length > 0 && expecting) {
				navigateToServer(serversInServersButNotInPrevServers[0].id);
				setExpecting(false);
			}
		}

		prevServers.current = servers;
	}, [servers, expecting, navigateToServer, prevServers, setExpecting]);

	useEffect(() => {
		socket.on("message", async (message: Message) => {
			const channel = akashicRecords[message.chatId];
			if (
				(message.user.id == "server" &&
					message.chatId == selectedServerId) ||
				!channel
			) {
				await serverMutate();
				return;
			}
			const messages = [...(akashicRecords[message.chatId] || [])];
			const messageFound = messages.find(
				(m: Message) => m.queueId == message.queueId,
			);

			if (message.user.id != session.id || !messageFound) {
				message.loaded = true;
				messages.push(message);
				const sortedByTime = messages.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime(),
				);
				setAkashicRecords({
					...akashicRecords,
					[message.chatId]: sortedByTime,
				});
			} else if (message.user.id == session.id) {
				setAkashicRecords((prev) => {
					const serverMessages = prev[message.chatId];
					if (serverMessages) {
						if (messageFound) {
							messageFound.loaded = true;
							messageFound.id = message.id;
						}
						return {
							...prev,
							[message.chatId]: serverMessages,
						};
					}
					return { ...prev };
				});
			}
		});

		socket.on("exception", (error: any) => {
			const { chatId, queueId, message } = error;
			if (queueId) {
				setAkashicRecords((prev) => {
					const serverMessages = prev[chatId];
					if (serverMessages) {
						const thisMessage = serverMessages.find(
							(m: Message) => m.queueId == queueId,
						);
						if (thisMessage) thisMessage.error = true;
						return {
							...prev,
							[chatId]: serverMessages,
						};
					}
					return { ...prev };
				});
			}
			toast.error(message);
		});

		return () => {
			socket.off("message");
			socket.off("exception");
		};
	}, [akashicRecords, selectedServerId, session.id, serverMutate]);

	useEffect(() => {
		if (expanded == false && selectedServer) {
			const type = selectedServer.isDM ? "friends" : "servers";
			if (listTab != type) setListTab(type);
		}
		if (selectedServer)
			setNotifications((prev: any) =>
				[...(prev || [])].filter(
					(n: Message) => n.chatId != selectedServer.id,
				),
			);
	}, [expanded, selectedServer, listTab, setNotifications]);

	useEffect(() => {
		prevSelectedServerId.current = selectedServerId;
	}, [displayedMessages]);

	useEffect(() => {
		if (!selectedServer)
			document.title = `Discover`
		else
			document.title = `${decodeURIComponent(selectedServer.name)} | Chat`
	}, [selectedServer]);

	return (
		<div
			suppressHydrationWarning
			className="relative z-10 mb-12 w-5/6 overflow-hidden rounded-[2rem] @container"
		>
			<ChatContext.Provider
				value={{
					akashicRecords,
					displayedMessages,
					expanded,
					listTab,
					selectedServerMembers,
					messageParents,
					selectedServerMessages: fixedSelectedServerMessages,
					selectedServer,
					selectedServerId,
					servers,
					serversMutate,
					setAkashicRecords,
					setDisplayedMessages,
					setExpanded,
					setListTab,
					setShowMembers,
					showMembers,
					serverMutate,
					prevSelectedServerId,
					selectedServerInvites,
					selectedServerBans,
					timesNavigated,
					setTimesNavigated,
					navigateToServer,
					prevSelectedServerMessages,
					selectedServerAdmins,
					prevDisplayedMessages,
				}}
			>
				<ServerList />
				{(selectedServerId || expecting) && (
					<LoadingSection
						isLoading={loadingSectionVisible}
						key={(selectedServerId ?? randomString())  + "loading"}
					/>
				)}
				{!loadingSectionVisible && (
					<ChatSection>{children}</ChatSection>
				)}
			</ChatContext.Provider>
		</div>
	);
}
