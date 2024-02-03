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
	fetcher,
	makeForm,
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
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
import { redirect, useRouter } from "next/navigation";

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

function useSelectedSeverId(router: any) {}

export default function Page({
	children,
	params,
}: {
	children: ReactNode;
	params: any;
}) {
	const router = useRouter();

	console.log("PARAMS: ", params);

	const { session } = useContext(PublicContext) as any;
	const { data: servers, mutate: serversMutate } = useSWR(
		"/chat/channel/list",
		fetcher,
	) as any;
	const prevServers = useRef(null) as any;
	const [listTab, setListTab] = useState<"servers" | "friends">("servers");
	const [showMembers, setShowMembers] = useState(true);
	const [expanded, setExpanded] = useState(false);
	const [selectedServerId, setSelectedServerId] = useState<string | null>(
		servers?.[0]?.id || null,
	);
	const selectedServer =
		servers?.find((server: Server) => server.id == selectedServerId) ||
		null;
	const prevSelectedServerId = useRef(selectedServerId);

	const [akashicRecords, setAkashicRecords] = useState<{
		[key: string]: Message[];
	}>({});
	const {
		data: selectedServerMessages,
		isLoading: selectedServerMessagesLoading,
		mutate: selectedServerMessagesMutate,
	} = useSWR(`/chat/channel/messages/${selectedServerId}`, fetcher, {
		onSuccess: (data) => {
			if (selectedServerId)
				setAkashicRecords({
					...akashicRecords,
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
				});
		},
	}) as any;
	const {
		data: selectedServerData,
		isLoading: selectedServerDataLoading,
		mutate: selectedServerDataMutate,
	} = useSWR(`/chat/channel/members/${selectedServerId}`, fetcher) as any;

	const [displayedMessages, setDisplayedMessages] = useState({});
	const messageParents = useRef({}) as any;
	const loadingSectionVisible =
		(selectedServerMessagesLoading && selectedServerMessages == null) ||
		(selectedServerDataLoading && selectedServerData == null);

	const messages = selectedServerId
		? akashicRecords[selectedServerId] || []
		: [];

	const members = selectedServerData?.members || [];
	const selectedServerInvites = selectedServerData?.invites || [];
	const selectedServerBans = selectedServerData?.bans || [];

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

	const serverMutate = async () => {
		await Promise.all([
			serversMutate(),
			selectedServerMessagesMutate(),
			selectedServerDataMutate(),
		]);
	};

	useEffect(() => {
		if (prevServers.current != null) {
			const serversInServersButNotInPrevServers = servers?.filter(
				(server: Server) =>
					!prevServers.current?.find(
						(prevServer: Server) => prevServer.id == server.id,
					),
			);

			if (serversInServersButNotInPrevServers?.length > 0) {
				setSelectedServerId(serversInServersButNotInPrevServers[0].id);
				router.push(
					`/chat/channel/${serversInServersButNotInPrevServers[0].id}`,
				);
			}
		}

		prevServers.current = servers;
	}, [servers]);

	useEffect(() => {
		socket.on("message", async (message: Message) => {
			const messages = akashicRecords[message.chatId] || [];
			const akashicRecordsServer = [...messages];
			if (
				(message.user.id == "server" &&
					message.chatId == selectedServerId) ||
				!akashicRecords[message.chatId]
			)
				await serverMutate();
			if (akashicRecordsServer && message.user.id != session.id) {
				message.loaded = true;
				akashicRecordsServer.push(message);
				const sortedByTime = akashicRecordsServer.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime(),
				);
				setAkashicRecords({
					...akashicRecords,
					[message.chatId]: sortedByTime,
				});
			} else if (
				akashicRecordsServer &&
				message.user.id == session.id &&
				akashicRecords[message.chatId]
			) {
				setAkashicRecords((prev) => {
					const serverMessages = prev[message.chatId];
					if (serverMessages) {
						const thisMessage = serverMessages.find(
							(m: Message) =>
								m.queueId == message.queueId && !m.loaded,
						);
						if (thisMessage) {
							thisMessage.loaded = true;
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
						if (thisMessage) {
							console.log("messagee found", thisMessage);
							thisMessage.error = true;
						} else {
							console.log(
								"messagee not found",
								queueId,
							);
						}
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
					members,
					messageParents,
					messages,
					selectedServer,
					selectedServerId,
					servers,
					serversMutate,
					setAkashicRecords,
					setDisplayedMessages,
					setExpanded,
					setListTab,
					setSelectedServerId,
					setShowMembers,
					showMembers,
					serverMutate,
					prevSelectedServerId,
					selectedServerInvites,
					selectedServerBans,
				}}
			>
				<ServerList />
				<LoadingSection
					key={selectedServerId + "loading"}
					isLoading={loadingSectionVisible}
				/>
				{!loadingSectionVisible && (
					<ChatSection>{children}</ChatSection>
				)}
			</ChatContext.Provider>
		</div>
	);
}
