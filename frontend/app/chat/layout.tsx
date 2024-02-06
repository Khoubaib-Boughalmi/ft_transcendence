"use client";
import { Button } from "@/components/Button";
import SuperImage from "@/components/SuperImage";
import {
	AirVent,
	ArrowLeft,
	ArrowRight,
	Check,
	Compass,
	Globe,
	Globe2,
	LogOut,
	MailPlus,
	Menu,
	MessageSquarePlus,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	SendHorizontal,
	Server as ServerIcon,
	Settings2,
	Sparkles,
	Trash2,
	UserPlus2,
	Users2,
	X,
} from "lucide-react";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { twMerge } from "tailwind-merge";
import UserList from "@/components/UserList";
import { user1, user2 } from "@/mocks/profile";
import {
	Dropdown,
	DropdownItem,
	DropdownTrigger,
	ScrollShadow,
	Spinner,
	Switch,
	Textarea,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import Input from "@/components/Input";
import { User } from "@/types/profile";
import generateBullshitExpression from "@/lib/bullshit";
import Divider from "@/components/Divider";
import { SuperDropdown, SuperDropdownMenu } from "@/components/SuperDropdown";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import {
	useChatContext,
	randomString,
	makeForm,
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
	fetcherUnsafe,
} from "@/lib/utils";
import ModalSet from "@/components/ModalSet";
import Card from "@/components/Card";
import PublicContext from "@/contexts/PublicContext";
import SettingSection from "@/components/SettingSection";
import SuperSwitch from "@/components/SuperSwitch";
import UploadButton from "@/components/UploadButton";
import DeleteButton from "@/components/DeleteButton";
import socket from "@/lib/socket";
import NoData from "@/components/NoData";
import toast from "react-hot-toast";
import Status from "@/components/Status";
import MessageInput from "@/components/MessageInput";
import {
	Server,
	Message,
	ChatContextType,
	Argument,
	Command,
} from "@/types/chat";
import { commands } from "@/constants/chat";
import ChatContext from "@/contexts/ChatContext";
import ServerList from "@/components/ServerList";
import LoadingSection from "@/components/LoadingSection";
import SectionContainer from "@/components/SectionContainer";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useServerList } from "@/lib/utils";

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
	const pathName = usePathname();
	const isChat = pathName.includes("/channel");
	const selectedServerId = isChat ? pathName.split("/").pop()! : null;
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

	const { session, expecting, setExpecting } = useContext(
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
	} = useSelectedServerData(selectedServerId);

	const [displayedMessages, setDisplayedMessages] = useState({});
	const messageParents = useRef({}) as any;
	const loadingSectionVisible =
		selectedServerMessagesLoading || selectedServerDataLoading || !akashicRecords;
		
	const fixedSelectedServerMessages = useSelectedServerMessagesFixer(
		selectedServerId ? (akashicRecords[selectedServerId] || selectedServerMessages) : [],
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
						if (thisMessage)
							thisMessage.error = true;
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
