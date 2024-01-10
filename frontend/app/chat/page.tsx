"use client";
import { Button } from "@/components/Button";
import SuperImage from "@/components/SuperImage";
import {
	AirVent,
	ArrowLeft,
	ArrowRight,
	Check,
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
	Server,
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
	useDisclosure,
} from "@nextui-org/react";
import Input from "@/components/Input";
import { User } from "@/types/profile";
import generateBullshitExpression from "@/lib/bullshit";
import Divider from "@/components/Divider";
import { SuperDropdown, SuperDropdownMenu } from "@/components/SuperDropdown";
import useSWR from "swr";
import {
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

const ChatContext = createContext({});

type Server = {
	name: string;
	description: string;
	icon: string;
	id: string;
	members: User[];
	enable_password: boolean;
	enable_inviteonly: boolean;
	owner: string;
	admins: string[];
	invites: User[];
};

type Message = {
	id: string;
	user: User;
	createdAt: Date;
	updatedAt: Date;
	content: string;
	target: string;
	noAvatar: boolean;
	blocked?: boolean;
	chatId: string;
	parent?: boolean;
	groupid: string;
};

type ChatContextType = {
	akashicRecords: { [key: string]: Message[] };
	displayedMessages: any;
	expanded: boolean;
	listTab: "servers" | "friends";
	members: User[];
	messageParents: any;
	messages: Message[];
	selectedServer: Server | undefined;
	selectedServerId: string | null;
	servers: Server[];
	serversMutate: () => Promise<void>;
	setAkashicRecords: (records: { [key: string]: Message[] }) => void;
	setDisplayedMessages: (displayedMessages: any) => void;
	setExpanded: (expanded: boolean) => void;
	setListTab: (tab: "servers" | "friends") => void;
	setSelectedServerId: (selectedServerId: string | null) => void;
	setShowMembers: (showMembers: boolean) => void;
	showMembers: boolean;
};

function useChatContext() {
	return useContext(ChatContext) as ChatContextType;
}

function ServerListEntry({ server }: { server: Server }) {
	const { expanded, selectedServerId, setSelectedServerId } =
		useChatContext();

	return (
		<Button
			onClick={() => {
				setSelectedServerId(server.id);
			}}
			variant="transparent"
			className={twMerge(
				"left-20 flex h-20 w-full justify-start gap-0 rounded-none p-0 pr-4 !outline-0 !ring-0	",
				selectedServerId == server.id && "bg-card-400",
			)}
		>
			<div className="relative aspect-square h-full flex-shrink-0 p-4">
				<div className="relative aspect-square h-full">
					<SuperImage
						src={server.icon}
						className="absolute inset-0 aspect-square h-full w-full rounded-2xl object-cover"
					/>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				<div
					className={twMerge(
						"flex h-full flex-col items-start justify-center overflow-hidden",
						expanded && "animate-lefttoright",
						!expanded && "animate-righttoleft",
					)}
				>
					<div className="max-w-full truncate text-sm">
						{server.name}
					</div>
					<div className="max-w-full truncate text-xs text-foreground-500">
						{server.description}
					</div>
				</div>
			</div>
		</Button>
	);
}

function ServerCreateButton() {
	const { expanded, serversMutate, setSelectedServerId, servers } =
		useChatContext();
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const { sessionMutate } = useContext(PublicContext) as any;
	const [createLoading, setCreateLoading] = useState(false);
	const [joinLoading, setJoinLoading] = useState(false);

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string).trim();
		if (name == "") return;
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/chat/channel/create`,
			makeForm({ name }),
			setCreateLoading,
			`Successfully created the channel`,
			`Failed to create the channel`,
			async () => {
				await serversMutate();
				onClose();
				(e.target as HTMLFormElement).reset();
			},
		);
	};

	const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string).trim();
		const password = (formData.get("password") as string).trim();
		if (name == "") return;
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/chat/channel/join`,
			makeForm({ name, password }),
			setJoinLoading,
			`Successfully joined the channel`,
			`Failed to join the channel`,
			async () => {
				await serversMutate();
				onClose();
				(e.target as HTMLFormElement).reset();
			},
		);
	};

	return (
		<ModalSet
			isOpen={isOpen}
			onClose={onClose}
			onOpenChange={onOpenChange}
			trigger={
				<Button
					onClick={onOpen}
					variant="transparent"
					className={twMerge(
						"left-20 flex h-20 w-full justify-start gap-0 rounded-none !bg-transparent p-0 !outline-0 !ring-0 hover:!from-transparent hover:!to-transparent",
						expanded && "h-24 p-4",
					)}
				>
					<div
						className={twMerge(
							"flex h-full w-full bg-card-100 transition-all hover:bg-white/10",
							expanded && "rounded-[100px] px-2",
						)}
					>
						<div className="relative aspect-square h-full flex-shrink-0">
							<div className="relative flex h-full w-full items-center justify-center rounded-2xl">
								<MessageSquarePlus
									size={32}
									strokeWidth={1.25}
								/>
							</div>
						</div>
						<div className="flex-1 overflow-hidden">
							<div
								className={twMerge(
									"flex h-full flex-col items-start justify-center overflow-hidden",
									expanded && "animate-lefttoright",
									!expanded && "animate-righttoleft",
								)}
							>
								<div className="max-w-full truncate text-sm">
									Add a Channel
								</div>
								{/* <div className="text-xs text-foreground-500 truncate max-w-full"></div> */}
							</div>
						</div>
					</div>
				</Button>
			}
			title="Add a Channel"
		>
			<div className="p-2">
				<Card header={"Create a Channel"} className="bg-card-200">
					<form
						onSubmit={handleCreate}
						className="flex flex-col items-end gap-4 p-4"
					>
						<p className="w-full">
							Channels are where your members communicate. They're
							best when organized around a topic - #games for
							example.
						</p>
						<div className="flex h-12 w-full gap-4">
							<Input
								name="name"
								placeholder="Enter a name"
								classNames={{
									container: "flex-1 w-auto",
								}}
								disabled={createLoading}
							/>
							<div className="flex aspect-square h-full items-center justify-center">
								<Button
									type="submit"
									className="aspect-square flex-shrink-0 rounded-full"
									startContent={<Plus />}
									iconOnly
									loading={createLoading}
								></Button>
							</div>
						</div>
					</form>
				</Card>
				<div className="my-4 flex items-center gap-4">
					<Divider /> OR <Divider />
				</div>
				<Card header="Join a Channel" className="bg-card-200">
					<form
						onSubmit={handleJoin}
						className="flex flex-col items-end gap-4 p-4"
					>
						<p className="w-full">
							Enter a channel name and password to join an
							existing channel.
						</p>
						<div className="flex h-12 w-full">
							<Input
								disabled={joinLoading}
								name="name"
								placeholder="Enter the channel name"
								classNames={{
									container: "flex-1 w-auto",
								}}
							/>
						</div>
						<div className="flex h-12 w-full">
							<Input
								disabled={joinLoading}
								name="password"
								type="password"
								placeholder="Enter the password (optional)"
								classNames={{
									container: "flex-1 w-auto",
								}}
							/>
						</div>
						<Button
							type="submit"
							className="h-12 flex-shrink-0 rounded-full pl-6"
							endContent={<ArrowRight />}
							loading={joinLoading}
						>
							Join
						</Button>
					</form>
				</Card>
			</div>
		</ModalSet>
	);
}

function MessageListEntry({
	message,
	index,
}: {
	message: Message;
	index: number;
}) {
	const date = new Date(message.createdAt).toLocaleDateString();
	const time = new Date(message.createdAt).toLocaleTimeString();
	const dateStr = date == new Date().toLocaleDateString() ? "Today" : date;
	const { displayedMessages, setDisplayedMessages, messageParents } =
		useChatContext();
	const displayed =
		displayedMessages[message.groupid] || message.blocked != true;

	if (message.blocked && !message.parent && displayed != true) return null;

	return (
		<>
			{displayed && (
				<div
					className={twMerge(
						"flex gap-4 px-4",
						!message.noAvatar && "mt-4",
					)}
				>
					<div
						className={twMerge(
							"relative h-0 w-12 flex-shrink-0",
							message.noAvatar && "opacity-0",
						)}
					>
						{!message.noAvatar && (
							<SuperImage
								src={message.user.avatar}
								className="absolute inset-0 rounded-full"
							/>
						)}
					</div>
					<div className={twMerge("flex flex-col")}>
						{!message.noAvatar && (
							<div
								className={twMerge(
									"flex items-center gap-2 text-sm text-foreground-600",
								)}
							>
								<div className="line-clamp-1">
									{message.user.username}
								</div>
								<div
									suppressHydrationWarning
									className="flex-shrink-0 text-xs text-foreground-500"
								>
									{dateStr + " at " + time}
								</div>
							</div>
						)}
						<div className="text-foreground-800">
							{message.content}
						</div>
					</div>
				</div>
			)}
			{message.blocked && message.parent && (
				<div className="mt-4 flex w-full justify-center gap-4 px-4 font-semibold">
					<Button
						variant="ghost"
						className="w-full select-none text-card-900 !outline-none !ring-0"
						onClick={() => {
							setDisplayedMessages((prev: any) => {
								return {
									...prev,
									[message.groupid]:
										prev[message.groupid] == true
											? false
											: true,
								};
							});
						}}
					>
						{(displayed
							? "Hide"
							: `Show ${
									messageParents.current[message.groupid]
								}`) +
							` Blocked Message${
								messageParents.current[message.groupid] == 1
									? ""
									: "s"
							}`}
					</Button>
				</div>
			)}
		</>
	);
}

function ServerList() {
	const { expanded, setExpanded, listTab, setListTab, servers } =
		useChatContext();

	return (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-l-3xl bg-card-300 @md:w-[19rem]">
			<div
				className={twMerge(
					"flex h-24 w-full select-none bg-card-300 p-0 transition-all",
					expanded && "p-4",
				)}
			>
				<div
					className={twMerge(
						"flex w-full overflow-hidden rounded-none transition-all",
						expanded && "rounded-[2rem]",
					)}
				>
					<Button
						variant="transparent"
						onClick={() => {
							setExpanded(!expanded);
						}}
						className="flex aspect-[85/100]  h-full flex-shrink-0 items-center justify-center rounded-none rounded-tl-3xl !outline-none !ring-0"
					>
						{expanded ? <ArrowLeft /> : <Menu />}
					</Button>
					<div className="flex flex-1 bg-card-250">
						{[
							["servers", Server, "Channels"],
							["friends", Users2, "Friends"],
						].map(([tab, Icon, text]: any) => (
							<Button
								key={tab}
								variant="transparent"
								onClick={() => {
									setListTab(tab);
								}}
								className={twMerge(
									"flex-1 flex-col gap-1 rounded-none text-xs !outline-none !ring-0",
									tab != listTab && "opacity-50",
								)}
							>
								<Icon size={18} />
								<span>{text}</span>
							</Button>
						))}
					</div>
				</div>
			</div>
			<div className="relative flex-1">
				<div className="absolute inset-0">
					<ScrollShadow size={64} className={"h-full w-full"}>
						{servers?.map((server, i) => (
							<ServerListEntry key={i} server={server} />
						))}
						<ServerCreateButton />
						{/* <ServerListEntry /> */}
					</ScrollShadow>
				</div>
			</div>
		</div>
	);
}

function MemberList() {
	const { expanded, showMembers, members, selectedServer } = useChatContext();

	return (
		<div
			className={twMerge(
				"no-scrollbar h-full w-80 flex-shrink-0 p-4 transition-all",
				!showMembers && "w-0 px-2",
			)}
		>
			<div
				className="no-scrollbar h-full overflow-hidden
							overflow-y-scroll rounded-3xl bg-gradient-to-t
							from-card-200 to-card-300 py-2"
			>
				<UserList
					type="list"
					hoverDelay={500}
					classNames={{
						list: "gap-0",
						entryContainer:
							"rounded-none px-4 bg-card-400 py-2 bg-transparent",
						entry: twMerge("", expanded && "hover:scale-100"),
					}}
					users={members}
					showBadge={(user) => {
						return selectedServer?.owner == user.id;
					}}
				/>
			</div>
		</div>
	);
}

function ChatInput() {
	const { messages, akashicRecords, setAkashicRecords, selectedServerId } =
		useChatContext();
	const { session } = useContext(PublicContext) as any;

	return (
		<div className="flex h-20 items-center gap-4 p-4 pr-1">
			<form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					if (!selectedServerId) return;
					e.preventDefault();
					const formData = new FormData(e.target as HTMLFormElement);
					const message = (formData.get("message") as string).trim();
					if (message == "") return;
					(e.target as HTMLFormElement).reset();
					const newId = randomString();
					setAkashicRecords({
						...akashicRecords,
						[selectedServerId]: [
							{
								user: session,
								createdAt: new Date(),
								content: message,
								noAvatar: false,
								target: "server",
								groupid: newId,
								chatId: selectedServerId,
								id: newId,
								updatedAt: new Date(),
							},
							...messages,
						],
					});

					socket.emit("message", {
						chatId: selectedServerId,
						message,
					});
				}}
				className="h-full w-full flex-1 flex-shrink-0 bg-card-300"
			>
				<Input
					id="message"
					autoComplete="off"
					name="message"
					placeholder="Send a message"
					classNames={{
						container: "pr-0",
					}}
					endContent={
						<Button
							startContent={<SendHorizontal />}
							type="submit	"
							variant="transparent"
							className="h-full rounded-none !border-0 px-4 !outline-none !ring-0"
							iconOnly
						></Button>
					}
				/>
			</form>
			<Button
				className="aspect-square flex-shrink-0"
				startContent={<Sparkles />}
				iconOnly
				onClick={() => {
					const input = document.querySelector(
						"#message",
					) as HTMLInputElement;
					const bs = generateBullshitExpression(
						["cryptoBS", ""][Math.floor(Math.random() * 2)],
					);
					input.value += " " + bs;
					input.focus();
				}}
			></Button>
		</div>
	);
}

function MemberControls({
	list,
	controls,
}: {
	list: User[];
	controls: ({ user }: { user: User }) => any;
}) {
	return (
		<Card className="relative h-64 overflow-hidden">
			<div className="absolute inset-0 overflow-y-scroll py-2">
				<UserList
					Controls={controls}
					type="list"
					users={list}
					classNames={{
						list: "gap-0",
						entryContainer: "bg-transparent py-2",
					}}
				/>
			</div>
		</Card>
	);
}

function InviteBox() {
	const { members, selectedServer, serversMutate } = useChatContext();
	const [loading, setLoading] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const username = ((formData.get("name") as string) || "").trim();
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/invite",
			makeForm({
				id: selectedServer?.id,
				username,
			}),
			setLoading,
			`Successfully invited ${username}`,
			`Failed to invite ${username}`,
			async () => {
				await serversMutate();
				formRef.current?.reset();
			},
		);
	};

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			className="flex w-full gap-4"
		>
			<Input
				disabled={loading}
				classNames={{
					container: "flex-1 h-12",
				}}
				placeholder="Enter a username"
				name="name"
			/>
			<Button
				variant="secondary"
				className="h-12 rounded-full"
				type="submit"
				startContent={<Plus />}
				loading={loading}
			>
				Invite
			</Button>
		</form>
	);
}

function RevokeInviteButton({ user }: { user: User }) {
	const { members, selectedServer, serversMutate } = useChatContext();
	const [loading, setLoading] = useState(false);

	const handleRevokeInvite = (user: User) => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/revoke_invite",
			makeForm({
				chatId: selectedServer?.id,
				userId: user.id,
			}),
			setLoading,
			`Successfully revoked invite to ${user.username}`,
			`Failed to revoke invite to ${user.username}`,
			serversMutate,
		);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handleRevokeInvite(user)}
				className="pl-3"
				startContent={<X />}
				variant="danger"
				loading={loading}
			>
				Revoke Invite
			</Button>
		</div>
	);
}

function RevokeBanButton({ user }: { user: User }) {
	const handleRevokeBan = (user: User) => {
		console.log(user);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handleRevokeBan(user)}
				className="pl-3"
				startContent={<X />}
				variant="danger"
			>
				Revoke Ban
			</Button>
		</div>
	);
}

function SettingsModal({ isOpen, onClose, onOpenChange }: any) {
	const { members, selectedServer, serversMutate } = useChatContext();
	const [passwordEnabled, setPasswordEnabled] = useState(
		selectedServer?.enable_password,
	);
	const [inviteOnlyEnabled, setInviteOnlyEnabled] = useState(
		selectedServer?.enable_inviteonly,
	);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = ((formData.get("name") as string) || "").trim();
		const topic = ((formData.get("topic") as string) || "").trim();
		const password = ((formData.get("password") as string) || "").trim();
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/update",
			makeForm({
				id: selectedServer?.id,
				name: name.length > 0 ? name : undefined,
				description: topic.length > 0 ? topic : undefined,
				password: passwordEnabled ? password : undefined,
			}),
			undefined,
			`Successfully updated the channel`,
			`Failed to update the channel`,
			async () => {
				await serversMutate();
				formRef.current?.reset();
			},
		);
	};

	const handleTogglePassword = (value: boolean) => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/update",
			makeForm({
				id: selectedServer?.id,
				enable_password: value,
			}),
			undefined,
			`Successfully ${
				!value ? "disabled" : "enabled"
			} password protection`,
			`Failed to ${!value ? "disable" : "enable"} password protection`,
			serversMutate,
		);
		setPasswordEnabled(value);
	};

	const handleToggleInviteOnly = (value: boolean) => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/update",
			makeForm({
				id: selectedServer?.id,
				enable_inviteonly: value,
			}),
			undefined,
			`Successfully ${!value ? "disabled" : "enabled"} invite only mode`,
			`Failed to ${!value ? "disable" : "enable"} invite only mode`,
			serversMutate,
		);
		setInviteOnlyEnabled(value);
	};

	if (!selectedServer) return null;

	return (
		<ModalSet
			placement="top"
			isOpen={isOpen}
			onClose={onClose}
			onOpenChange={onOpenChange}
			title={selectedServer.name}
		>
			<div className="p-2">
				<Card
					header="General Settings"
					className="bg-card-200"
					footer={
						<div className="flex w-full justify-end">
							<Button
								type="submit"
								form="general"
								startContent={<Check />}
							>
								Submit
							</Button>
						</div>
					}
				>
					<form
						ref={formRef}
						id="general"
						onSubmit={handleSubmit}
						className="hidden"
					/>
					<div className="flex flex-col items-center gap-4 p-4">
						<div className="flex w-full gap-8">
							<div className="aspect-square h-[252px] flex-shrink-0">
								<div className="relative h-full w-full">
									<SuperImage
										className="absolute inset-0 aspect-square h-full w-full rounded-2xl object-cover"
										src={selectedServer?.icon}
									/>
								</div>
							</div>
							<div className="flex flex-1 flex-col gap-4">
								<SettingSection title="Channel Name">
									<Input
										form="general"
										classNames={{
											container: "w-auto h-12",
										}}
										placeholder={selectedServer?.name}
										name="name"
									/>
								</SettingSection>
								<SettingSection title="Channel Topic">
									<Input
										form="general"
										classNames={{
											container: "w-auto h-12",
										}}
										placeholder={
											selectedServer?.description
										}
										name="topic"
									/>
								</SettingSection>
								<SettingSection title="Channel Icon">
									<div className="flex gap-2">
										<UploadButton
											endpoint="/chat/channel/upload-icon"
											name="icon"
											variant="secondary"
											data={{
												id: selectedServer?.id,
											}}
											callback={async () => {
												await serversMutate();
											}}
										>
											Upload Icon
										</UploadButton>
										<DeleteButton
											data={{
												id: selectedServer?.id,
											}}
											callback={async () => {
												await serversMutate();
											}}
											endpoint="/chat/channel/delete-icon"
											type="icon"
										></DeleteButton>
									</div>
								</SettingSection>
							</div>
						</div>

						<Divider className="my-4" />
						<SettingSection title="Password">
							<div className="flex w-full flex-col gap-4">
								<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
									Enable password protection
									<div className="relative flex flex-1 items-center justify-end">
										<SuperSwitch
											isSelected={passwordEnabled}
											onValueChange={handleTogglePassword}
											className="absolute"
										/>
									</div>
								</div>
								<p className="text-base leading-4">
									When enabled, users will be required to
									enter the password to join the channel.
								</p>
								<Input
									form="general"
									disabled={!passwordEnabled}
									classNames={{
										container: "w-auto h-12",
									}}
									placeholder="Enter a password"
									name="password"
									type="password"
								/>
							</div>
						</SettingSection>
					</div>
				</Card>
				<Divider className="my-8" />
				<Card header={"Member Settings"} className="bg-card-200">
					<div className="flex flex-col items-center gap-4 p-4">
						<SettingSection title="Invites">
							<div className="flex w-full flex-col gap-4">
								<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
									Enable invite-only
									<div className="relative flex flex-1 items-center justify-end">
										<SuperSwitch
											isSelected={inviteOnlyEnabled}
											onValueChange={
												handleToggleInviteOnly
											}
											className="absolute"
										/>
									</div>
								</div>
								<p className="text-base leading-4">
									When enabled, users will need an invite to
									join the channel.
								</p>
								<div
									className={twMerge(
										"flex flex-col gap-4",
										!inviteOnlyEnabled &&
											"pointer-events-none brightness-50",
									)}
								>
									<MemberControls
										list={selectedServer?.invites || []}
										controls={RevokeInviteButton}
									/>
									<InviteBox />
								</div>
							</div>
						</SettingSection>
						<Divider className="my-4" />
						<SettingSection title="Bans">
							<div className="flex w-full flex-col gap-4">
								<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
									Banned users
								</div>
								<MemberControls
									list={members}
									controls={RevokeBanButton}
								/>
							</div>
						</SettingSection>
					</div>
				</Card>
			</div>
		</ModalSet>
	);
}

function DiscoverPage() {
	return (
		<div className="no-scrollbar flex min-h-full w-full flex-col overflow-y-scroll">
			<div className="h-2/3 w-full shrink-0 p-12">
				<div className="relative h-full w-full overflow-hidden rounded-xl bg-card-200">
					<div className="h-full w-full">
						<SuperImage
							src="/background2.png"
							className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-color-dodge	"
						/>
					</div>
					<div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2">
						<div className="flex items-end justify-center text-4xl font-medium">
							Find your community on 1337
						</div>
						<p className="text-center text-foreground-500">
							From gaming, to music, to learning, there's a place
							for you.
						</p>
						<Input
							classNames={{
								container: "w-1/2 mt-4 bg-card-400 ",
							}}
							placeholder="Enter a keyword"
							startContent={
								<Search className="text-background-800" />
							}
						/>
					</div>
				</div>
			</div>
			<Divider className="shrink-0" />
			<div className=" grid flex-1 flex-shrink-0 grid-cols-4 gap-4 p-12">
				{Array.from({ length: 20 }).map((_, i) => (
					<div key={i} className="aspect-video w-full rounded-3xl bg-card-200">
						<div className="relative h-1/2 overflow-hidden rounded-t-3xl">
							<SuperImage
								src="/pfp.png"
								className="absolute inset-0 h-full w-full scale-150 rounded object-cover opacity-75 blur-md"
							/>
						</div>
						<div className="flex h-1/2 w-full flex-col gap-4">
							<div className="flex h-16 shrink-0 items-center gap-20 pl-4">
								<div className="aspect-square h-full">
									<div className="relative aspect-square h-[200%] -translate-y-1/2">
										<SuperImage
											src="/pfp.png"
											className="absolute inset-0 h-full w-full rounded-xl object-cover"
										/>
									</div>
								</div>
								<div className="flex h-12 w-full flex-col items-start justify-center">
									<span>ddjkasjsksa</span>
									<span className="flex items-center gap-1 text-xs text-foreground-500">
										<Globe2 size={12} /> Public
									</span>
								</div>
							</div>
							<div className="flex-1 overflow-hidden rounded-b-3xl bg-black/25 p-4 text-foreground-400">
								{generateBullshitExpression("techBS")}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function SectionContainer({
	children,
}: any) {
	const { expanded } = useChatContext();

	return (
		<div
			className={twMerge(
				"absolute inset-0 flex translate-x-full flex-col overflow-hidden rounded-r-3xl bg-gradient-to-tr from-card-300 from-40% to-card-500 transition-all @md:left-20 @md:translate-x-0",
				expanded &&
					"translate-x-0 select-none brightness-50 @md:translate-x-56",
			)}>
			{children}
		</div>
	)
}

function ChatSection() {
	const {
		expanded,
		setExpanded,
		showMembers,
		setShowMembers,
		messages,
		selectedServer,
		selectedServerId,
		serversMutate,
	} = useContext(ChatContext) as ChatContextType;
	const messageBoxRef = useRef<HTMLDivElement>(null);
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	useEffect(() => {
		const messageBox = messageBoxRef.current;
		if (messageBox) {
			console.log("attmepting to scroll")
			const currentScroll = messageBox.scrollTop;
			const currentHeight = messageBox.scrollHeight;
			const visibleHeight = messageBox.clientHeight;
			const difference = currentHeight - currentScroll;
			if (currentHeight - currentScroll < visibleHeight * 2)
				messageBox.scrollTop = messageBox.scrollHeight + 1;
		}
	}, [messages, selectedServerId, messageBoxRef]);

	useEffect(() => {
		const messageBox = messageBoxRef.current;
		if (messageBox) {
			messageBox.scrollTop = messageBox.scrollHeight + 1;
		}
	}, [messageBoxRef]);

	const handleLeave = () => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/leave",
			makeForm({
				id: selectedServer?.id,
			}),
			undefined,
			`Successfully left the channel`,
			`Failed to leave the channel`,
			serversMutate,
		);
	};

	return (
		<SectionContainer>
			<SettingsModal
				key={selectedServer?.id}
				isOpen={isOpen}
				onClose={onClose}
				onOpenChange={onOpenChange}
			/>
			{selectedServer ? (
				<>
					{expanded && (
						<div
							onClick={() => setExpanded(false)}
							className="absolute inset-0 z-10"
						></div>
					)}
					<div className="flex h-full w-full gap-0">
						<div className="flex flex-1 flex-col">
							<div className="flex h-24 w-full flex-shrink-0 p-4 pr-0">
								<div className="flex h-full w-full gap-2 rounded-full bg-card-275">
									<div className="aspect-square h-full p-2">
										<div className="relative h-full w-full flex-shrink-0">
											<SuperImage
												className="absolute inset-0 aspect-square h-full w-full rounded-full object-cover"
												src={selectedServer.icon}
											/>
										</div>
									</div>
									<div className="flex flex-col justify-center">
										<div className="text-sm">
											{selectedServer.name}
										</div>
										<div className="text-xs text-foreground-500">
											{selectedServer.description}
										</div>
									</div>
									<div className="flex flex-1 items-center justify-end gap-2 px-4">
										<Button variant="ghost" iconOnly>
											<UserPlus2 />
										</Button>
										<Button
											iconOnly={showMembers == false}
											variant={
												showMembers
													? undefined
													: "ghost"
											}
											onClick={() =>
												setShowMembers(!showMembers)
											}
										>
											<Users2 />
										</Button>
										<SuperDropdown>
											<DropdownTrigger>
												<div>
													<Button
														variant="transparent"
														iconOnly
													>
														<MoreHorizontal />
													</Button>
												</div>
											</DropdownTrigger>
											<SuperDropdownMenu
												onAction={(action) => {
													if (action == "settings") {
														onOpen();
													} else if (
														action == "leave"
													) {
														handleLeave();
													}
												}}
											>
												<DropdownItem
													key={"settings"}
													startContent={<Settings2 />}
												>
													Settings
												</DropdownItem>
												<DropdownItem
													startContent={<LogOut />}
													data-exclude={true}
													color="danger"
													key={"leave"}
												>
													Leave
												</DropdownItem>
											</SuperDropdownMenu>
										</SuperDropdown>
									</div>
								</div>
							</div>
							<div className="relative flex-1">
								<div
									ref={messageBoxRef}
									className="no-scrollbar chatbox absolute inset-0 overflow-y-scroll"
								>
									<div
										suppressHydrationWarning
										className="flex min-h-full flex-col-reverse gap-0 p-2"
									>
										{messages.map((message, i) => {
											return (
												<MessageListEntry
													key={i}
													index={i}
													message={message}
												/>
											);
										})}
										<div className="w-full p-8 pb-0">
											<p className="text-foreground-500">
												This is the start of the
												channel's history, it's a lonely
												place...
											</p>
											<p className="text-xl">
												Invite some friends to get the
												conversation started!
											</p>
											<Button
												onClick={onOpen}
												className="mt-2"
												startContent={<Pencil />}
											>
												Edit channel
											</Button>
											<Divider className="mt-4" />
										</div>
									</div>
								</div>
							</div>
							<ChatInput />
						</div>
						<MemberList />
					</div>
				</>
			) : (
				<DiscoverPage />
			)}
		</SectionContainer>
	);
}

const randomString = () => Math.random().toString(36).substring(7);

function LoadingSection({
	isLoading,
}: {
	isLoading?: boolean;
}) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		if (isLoading == false)
			setTimeout(() => {
				setVisible(false);
			}, 500);

	}, [isLoading]);

	return (
		visible && <div className={twMerge("z-20 absolute inset-0 transition-opacity opacity-100 duration-500", !isLoading && "opacity-0")} >
			<SectionContainer>
				<div className="flex h-full w-full justify-center items-center">
					<Spinner/>
				</div>
			</SectionContainer>
		</div>
	)
}

export default function Page() {
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

	const [akashicRecords, setAkashicRecords] = useState<{
		[key: string]: Message[];
	}>({});
	const {
		data: selectedServerMessages,
		isLoading: selectedServerMessagesLoading,
	} = useSWR(`/chat/channel/messages/${selectedServerId}`, fetcher, {
		onSuccess: (data) => {
			if (selectedServerId)
				setAkashicRecords({
					...akashicRecords,
					[selectedServerId]: ((data as any) || []).map((message: Message) => {
						message.groupid = message.id;
						return message;
					})
				});
		},
	}) as any;

	const [displayedMessages, setDisplayedMessages] = useState({});
	const messageParents = useRef({}) as any;
	const loadingSectionVisible = selectedServerMessagesLoading && (selectedServerMessages == null);

	const messages = selectedServerId
		? akashicRecords[selectedServerId] || []
		: [];

	const members = selectedServer?.members || [];
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
			}
		}

		prevServers.current = servers;
	}, [servers]);

	useEffect(() => {
		socket.on("message", (message: Message) => {
			const akashicRecordsServer = [...akashicRecords[message.chatId]];
			if (akashicRecordsServer && message.user.id != session.id) {
				akashicRecordsServer.push(message);
				const sortedByTime = akashicRecordsServer.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
				setAkashicRecords({
					...akashicRecords,
					[message.chatId]: sortedByTime,
				});
			}

		});
		return () => {
			socket.off("message");
		}
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
				}}
			>
				<ServerList />
				<LoadingSection key={selectedServerId} isLoading={loadingSectionVisible} />
				{!loadingSectionVisible && <ChatSection key={selectedServerId} />}
			</ChatContext.Provider>
		</div>
	);
}
