"use client";
import { Button } from "@/components/Button";
import SuperImage from "@/components/SuperImage";
import {
	AirVent,
	ArrowLeft,
	ArrowRight,
	Check,
	LogOut,
	MailPlus,
	Menu,
	MessageSquarePlus,
	MoreHorizontal,
	Pencil,
	Plus,
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
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
} from "@/lib/utils";
import ModalSet from "@/components/ModalSet";
import Card from "@/components/Card";
import PublicContext from "@/contexts/PublicContext";
import SettingSection from "@/components/SettingSection";
import SuperSwitch from "@/components/SuperSwitch";
import UploadButton from "@/components/UploadButton";
import DeleteButton from "@/components/DeleteButton";

const ChatContext = createContext({});

type Server = {
	name: string;
	description: string;
	icon: string;
	id: string;
	members: User[];
};

type Message = {
	user: User;
	time: Date;
	content: string;
	target: string;
	noAvatar: boolean;
	blocked?: boolean;
	groupid: string;
	parent?: boolean;
};

type ChatContextType = {
	servers: Server[];
	setServers: (servers: Server[]) => void;
	expanded: boolean;
	setExpanded: (expanded: boolean) => void;
	listTab: "servers" | "friends";
	setListTab: (tab: "servers" | "friends") => void;
	showMembers: boolean;
	setShowMembers: (showMembers: boolean) => void;
	messages: Message[];
	akashicRecords: { [key: string]: Message[] };
	setAkashicRecords: (records: { [key: string]: Message[] }) => void;
	members: User[];
	setMembers: (members: User[]) => void;
	displayedMessages: any;
	setDisplayedMessages: (displayedMessages: any) => void;
	messageParents: any;
	selectedServer: Server | undefined;
	selectedServerId:  string | null;
	setSelectedServerId: (selectedServerId: string | null) => void;
};

function useChatContext() {
	return useContext(ChatContext) as ChatContextType;
}

function ServerListEntry({ server }: { server: Server }) {
	const { expanded, setSelectedServerId } = useChatContext();

	return (
		<Button
			onClick={() => {
				setSelectedServerId(server.id);
			}}
			variant="transparent"
			className="left-20 flex h-20 w-full justify-start gap-0 rounded-none p-0 pr-4 !outline-0 !ring-0"
		>
			<div className="relative aspect-square h-full flex-shrink-0 p-4">
				<div className="relative h-full w-full">
					<SuperImage
						src={server.icon}
						className="absolute inset-0 rounded-2xl"
					/>
				</div>
			</div>
			<div
				className={twMerge(
					"flex h-full flex-col items-start justify-center overflow-hidden",
					expanded && "animate-lefttoright",
					!expanded && "animate-righttoleft",
				)}
			>
				<div className="max-w-full truncate text-sm">{server.name}</div>
				<div className="max-w-full truncate text-xs text-foreground-500">
					{server.description}
				</div>
			</div>
		</Button>
	);
}

function ServerCreateButton() {
	const { expanded } = useChatContext();
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string).trim();
		if (name == "") return;
		console.log(name);
		(e.target as HTMLFormElement).reset();
	};

	const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string).trim();
		const password = (formData.get("password") as string).trim();
		if (name == "") return;
		console.log(name, password);
		(e.target as HTMLFormElement).reset();
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
							/>
							<div className="flex aspect-square h-full items-center justify-center">
								<Button
									type="submit"
									className="aspect-square flex-shrink-0 rounded-full"
									startContent={<Plus />}
									iconOnly
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
								name="name"
								placeholder="Enter the channel name"
								classNames={{
									container: "flex-1 w-auto",
								}}
							/>
						</div>
						<div className="flex h-12 w-full">
							<Input
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
	const date = message.time.toLocaleDateString();
	const time = message.time.toLocaleTimeString();
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
					<ScrollShadow size={64} className="h-full w-full">
						{servers.map((server, i) => (
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
	const { expanded, showMembers, members } = useChatContext();

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
					showBadge={true}
				/>
			</div>
		</div>
	);
}

function ChatInput() {
	const { messages, akashicRecords, setAkashicRecords, selectedServerId } = useChatContext();

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
					setAkashicRecords({
						...akashicRecords,
						[selectedServerId]: [
							{
								user: user1,
								time: new Date(),
								content: message,
								noAvatar: false,
								target: "server",
								groupid: randomString(),
							},
							...messages,
						],
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
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const username = (formData.get("name") as string || "").trim();
		console.log(username);
		e.currentTarget.reset();
	};

	return (
		<form onSubmit={handleSubmit} className="flex w-full gap-4">
			<Input
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
			>
				Invite
			</Button>
		</form>
	);
}

function RevokeInviteButton({ user }: { user: User }) {
	const handleRevokeInvite = (user: User) => {
		console.log(user);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handleRevokeInvite(user)}
				className="pl-3"
				startContent={<X />}
				variant="danger"
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
	const { members, selectedServer } = useChatContext();
	const [passwordEnabled, setPasswordEnabled] = useState(false);
	const [inviteOnlyEnabled, setInviteOnlyEnabled] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string || "").trim();
		const topic = (formData.get("topic") as string || "").trim();
		const password = (formData.get("password") as string || "").trim();
		console.log(name, topic, password, passwordEnabled);
		e.currentTarget.reset();
	};

	const handleTogglePassword = (value: boolean) => {
		console.log(value);
		setPasswordEnabled(value);
	}

	const handleToggleInviteOnly = (value: boolean) => {
		console.log(value);
		setInviteOnlyEnabled(value);
	}

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
							<Button type="submit" form="general" startContent={<Check />}>Submit</Button>
						</div>
					}
				>
					<form
						id="general"
						onSubmit={handleSubmit}
						className="hidden"
					/>
					<div className="flex flex-col items-center gap-4 p-4">
						<div className="flex w-full gap-8">
							<div className="aspect-square h-[252px] flex-shrink-0">
								<div className="relative h-full w-full">
									<SuperImage
										className="absolute inset-0 rounded-2xl"
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
											endpoint="no"
											name="icon"
											variant="secondary"
										>
											Upload Icon
										</UploadButton>
										<DeleteButton
											endpoint="no"
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
											onValueChange={handleToggleInviteOnly}
										 className="absolute" />
									</div>
								</div>
								<p className="text-base leading-4">
									When enabled, users will need an invite to
									join the channel.
								</p>
								<div className={twMerge("flex flex-col gap-4", !inviteOnlyEnabled && "brightness-50 pointer-events-none")}>

									<MemberControls
										list={members}
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

function ChatSection() {
	const {
		expanded,
		setExpanded,
		showMembers,
		setShowMembers,
		messages,
		selectedServer
	} = useContext(ChatContext) as ChatContextType;
	const messageBoxRef = useRef<HTMLDivElement>(null);
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	useEffect(() => {
		const messageBox = messageBoxRef.current;
		if (messageBox) {
			const currentScroll = messageBox.scrollTop;
			const currentHeight = messageBox.scrollHeight;
			const visibleHeight = messageBox.clientHeight;
			const difference = currentHeight - currentScroll;
			if (currentHeight - currentScroll < visibleHeight * 2)
				messageBox.scrollTop = messageBox.scrollHeight + 1;
		}
	}, [messages]);

	useEffect(() => {
		const messageBox = messageBoxRef.current;
		if (messageBox) {
			messageBox.scrollTop = messageBox.scrollHeight + 1;
		}
	}, []);

	if (!selectedServer) return null;

	return (
		<div
			className={twMerge(
				"absolute inset-0 flex translate-x-full flex-col overflow-hidden rounded-r-3xl bg-gradient-to-tr from-card-300 from-40% to-card-500 transition-all @md:left-20 @md:translate-x-0",
				expanded &&
					"translate-x-0 select-none brightness-50 @md:translate-x-56",
			)}
		>
			<SettingsModal
				isOpen={isOpen}
				onClose={onClose}
				onOpenChange={onOpenChange}
			/>
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
										className="absolute inset-0 rounded-full"
										src="/pfp.png"
									/>
								</div>
							</div>
							<div className="flex flex-col justify-center">
								<div className="text-sm">{
									selectedServer.name
								}</div>
								<div className="text-xs text-foreground-500">
									{
										selectedServer.description
									}
								</div>
							</div>
							<div className="flex flex-1 items-center justify-end gap-2 px-4">
								<Button variant="ghost" iconOnly>
									<UserPlus2 />
								</Button>
								<Button
									iconOnly={showMembers == false}
									variant={showMembers ? undefined : "ghost"}
									onClick={() => setShowMembers(!showMembers)}
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
										This is the start of the channel's history, it's a lonely place...
									</p>
									<p className="text-xl">
										Invite some friends to get the conversation started!
									</p>
									<Button onClick={onOpen} className="mt-2" startContent={
										<Pencil />
									}>
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
		</div>
	);
}

const randomString = () => Math.random().toString(36).substring(7);

export default function Page() {
	const { data: fckUser } = useSWR("/user/profile/fck", fetcher) as any;
	const { data: mrianUser } = useSWR("/user/profile/mrian", fetcher) as any;

	const [listTab, setListTab] = useState<"servers" | "friends">("servers");
	const [showMembers, setShowMembers] = useState(true);
	const [expanded, setExpanded] = useState(false);
	const [members, setMembers] = useState<User[]>(
		Array.from({ length: 7 }).map((_, i: number) =>
			i % 2 == 0 ? user1 : user2,
		),
	);
	const [servers, setServers] = useState<Server[]>(
		Array.from({ length: 7 }).map((_, i: number) => ({
			name: generateBullshitExpression("cryptoBS"),
			description: Array.from({ length: Math.max(1, Math.random() * 10) })
				.map(() => generateBullshitExpression("cryptoBS"))
				.join(" "),
			icon: "/pfp.png",
			id: randomString(),
			members: Array.from({ length: 7 }).map((_, i: number) =>
				i % 2 == 0 ? user1 : user2,
			),
		})),
	);
	const [selectedServerId, setSelectedServerId] = useState<string | null>(
		servers[0].id,
	);
	const selectedServer = servers.find(
		(server) => server.id == selectedServerId,
	);

	const [displayedMessages, setDisplayedMessages] = useState({});
	const messageParents = useRef({}) as any;

	const [akashicRecords, setAkashicRecords] = useState<{ [key: string]: Message[] }>({
		[servers[0].id]: Array.from({ length: 3 }).map((_, i: number) => ({
			user: i % 4 === 0 ? user1 : user2,
			time: new Date(),
			content: Array.from({ length: Math.floor(Math.random() * 100) })
				.map(() =>
					generateBullshitExpression(
						["cryptoBS", ""][Math.floor(Math.random() * 2)],
					),
				)
				.join(" "),
			noAvatar: false,
			target: "server",
			groupid: randomString(),
			blocked: i % 4 !== 0,
		})),
	});

	console.log(akashicRecords);	

	const messages = selectedServerId ? akashicRecords[selectedServerId] || [] : [];

	messageParents.current = {};
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].user == messages[i + 1]?.user) {
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
		if (fckUser && mrianUser) setMembers([fckUser, mrianUser]);
		else {
			console.log("fckUser", fckUser);
			console.log("mrianUser", mrianUser);
		}
	}, [fckUser, mrianUser]);

	return (
		<div
			suppressHydrationWarning
			className="relative z-10 mb-12 w-5/6 overflow-hidden rounded-3xl @container"
		>
			<ChatContext.Provider
				value={{
					servers,
					setServers,
					expanded,
					setExpanded,
					listTab,
					setListTab,
					showMembers,
					setShowMembers,
					messages,
					akashicRecords,
					setAkashicRecords,
					members,
					setMembers,
					displayedMessages,
					setDisplayedMessages,
					messageParents,
					selectedServer,
					selectedServerId,
					setSelectedServerId,
				}}
			>
				<ServerList />
				<ChatSection />
			</ChatContext.Provider>
		</div>
	);
}
