"use client";
import LoadingSection from "@/components/LoadingSection";
import SectionContainer from "@/components/SectionContainer";
import ServerList from "@/components/ServerList";
import ChatContext from "@/contexts/ChatContext";
import PublicContext from "@/contexts/PublicContext";
import socket from "@/lib/socket";
import { useServerId } from "@/lib/utils";
import { fetcherUnsafe, useChatContext, useServerList } from "@/lib/utils";
import { Message, Server } from "@/types/chat";
import { User } from "@/types/profile";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
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

function      useSelectedServerMessages(
	selectedServerId: string | null,
	setAkashicRecords: any,
) {
	const { session } = useContext(PublicContext) as any;

	const {
		data: selectedServerMessages,
		isLoading: selectedServerMessagesLoading,
		mutate: selectedServerMessagesMutate,
		isValidating: selectedServerMessagesValidating,
	} = useSWR(
		selectedServerId ? `/chat/channel/messages/${selectedServerId}` : null,
		fetcherUnsafe,
		{
			onSuccess: (data) => {
				if (selectedServerId)
					setAkashicRecords((prev: any) => ({
						...prev,
						[selectedServerId]: ((data as any) || []).map(
							(message: Message) => {
								message.groupid = message.id;
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

	return {
		selectedServerData,
		selectedServerDataLoading,
		selectedServerDataMutate,
		selectedServerMembers: selectedServerData?.members || [],
		selectedServerInvites: selectedServerData?.invites || [],
		selectedServerBans: selectedServerData?.bans || [],
		selectedServerAdmins: selectedServerData?.admins || []
	};
}

function useSelectedServerMessagesFixer(
	selectedServerMessages: Message[],
	messageParents: any,
) {
	const messages = [...(selectedServerMessages || [])];

	messageParents.current = {};
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
			messageParents.current[messages[i].groupid] += 1;
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

	const { session, expecting, setExpecting, setNotifications } = useContext(
		PublicContext,
	) as any;
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
		selectedServerAdmins
	} = useSelectedServerData(selectedServerId);

	const [displayedMessages, setDisplayedMessages] = useState({});
	const messageParents = useRef({}) as any;
	const loadingSectionVisible =
		selectedServerMessagesLoading ||
		selectedServerDataLoading ||
		!akashicRecords;

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
	}, [akashicRecords]);

	const serverMutate = async () => {
		await Promise.all([
			serversMutate(),
			selectedServerMessagesMutate(),
			selectedServerDataMutate(),
		]);
	};

	const navigateToServer = (serverId: string) => {
		setTimesNavigated((prev) => prev + 1);
		router.push(`/chat/channel/${serverId}`);
	};

	useEffect(() => {
		if (prevServers.current != null) {
			const serversInServersButNotInPrevServers = servers?.filter(
				(server: Server) =>
					!prevServers.current?.find(
						(prevServer: Server) => prevServer.id == server.id,
					),
			);

			if (serversInServersButNotInPrevServers?.length > 0 && expecting) {
				setExpecting(false);
				navigateToServer(serversInServersButNotInPrevServers[0].id);
			}
		}

		prevServers.current = servers;
	}, [servers]);

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
	}, [akashicRecords]);

	useEffect(() => {
		if (expanded == false && selectedServer) {
			const type = selectedServer.isDM ? "friends" : "servers";
			if (listTab != type) setListTab(type);
		}
		if (selectedServer)
			setNotifications((prev: any) =>
				[...prev].filter((n: Message) => n.chatId != selectedServer.id),
			);
	}, [expanded, selectedServer]);

	return (
		<div
			suppressHydrationWarning
			className="relative z-10 mb-12 w-5/6 overflow-hidden rounded-3xl @container"
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
					selectedServerAdmins
				}}
			>
				<ServerList />
				{selectedServerId && (
					<LoadingSection
						isLoading={loadingSectionVisible}
						key={selectedServerId + "loading"}
					/>
				)}
				{!loadingSectionVisible && (
					<ChatSection>{children}</ChatSection>
				)}
			</ChatContext.Provider>
		</div>
	);
}
