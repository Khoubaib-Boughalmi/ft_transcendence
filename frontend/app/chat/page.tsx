"use client";
import { Button } from "@/components/Button";
import SuperImage from "@/components/SuperImage";
import {
	AirVent,
	ArrowLeft,
	LogOut,
	Menu,
	MoreHorizontal,
	SendHorizontal,
	Server,
	Settings2,
	Sparkles,
	UserPlus2,
	Users2,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import UserList from "@/components/UserList";
import { user1, user2 } from "@/mocks/profile";
import { Dropdown, DropdownItem, DropdownTrigger, ScrollShadow, Textarea } from "@nextui-org/react";
import Input from "@/components/Input";
import { User } from "@/types/profile";
import generateBullshitExpression from "@/lib/bullshit";
import Divider from "@/components/Divider";
import { SuperDropdown, SuperDropdownMenu } from "@/components/SuperDropdown";

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
	expanded: boolean;
	setExpanded: (expanded: boolean) => void;
	listTab: "servers" | "friends";
	setListTab: (tab: "servers" | "friends") => void;
	showMembers: boolean;
	setShowMembers: (showMembers: boolean) => void;
	messages: Message[];
	setMessages: (messages: Message[]) => void;
	members: User[];
	setMembers: (members: User[]) => void;
	displayedMessages: any;
	setDisplayedMessages: (displayedMessages: any) => void;
	messageParents: any;
};

function useChatContext() {
	return useContext(ChatContext) as ChatContextType;
}

function ServerListEntry() {
	const { expanded } = useChatContext();

	return (
		<Button
			variant="transparent"
			className="left-20 flex h-20 w-full justify-start gap-0 rounded-none p-0 !outline-0 !ring-0"
		>
			<div className="relative aspect-square h-full flex-shrink-0 p-4">
				<div className="relative h-full w-full">
					<SuperImage
						src="/pfp.png"
						className="absolute inset-0 rounded-full"
					/>
				</div>
			</div>
			<div
				className={twMerge(
					"flex h-full flex-col items-start justify-center",
					expanded && "animate-lefttoright",
					!expanded && "animate-righttoleft",
				)}
			>
				<div className="text-sm">servername</div>
				<div className="text-xs text-foreground-500">something</div>
			</div>
		</Button>
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
				<div className="flex gap-4 px-4">
					<div
						className={twMerge(
							"relative h-12 w-12 flex-shrink-0",
							message.noAvatar && "h-0 opacity-0",
						)}
					>
						<SuperImage
							src={message.user.avatar}
							className="absolute inset-0 rounded-full"
						/>
					</div>
					<div
						className={twMerge(
							"jsutify-end flex flex-col",
							message.noAvatar && "-mt-4",
						)}
					>
						<div
							className={twMerge(
								"flex items-center gap-2 text-sm text-foreground-600",
								message.noAvatar && "hidden",
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
						<div className="text-foreground-800">
							{message.content}
						</div>
					</div>
				</div>
			)}
			{message.blocked && message.parent && (
				<div className="flex w-full justify-center gap-4 px-4 font-semibold">
					<Button
						variant="ghost"
						className="w-full select-none !outline-none !ring-0 text-card-900"
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
	const { expanded, setExpanded, listTab, setListTab } = useChatContext();

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
						{Array.from({ length: 100 }).map((something, i) => (
							<ServerListEntry key={i} />
						))}
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
				/>
			</div>
		</div>
	);
}

function ChatInput() {
	const { messages, setMessages } = useChatContext();

	return (
		<div className="flex h-20 items-center gap-4 p-4 pr-1">
			<form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					e.preventDefault();
					const formData = new FormData(e.target as HTMLFormElement);
					const message = (formData.get("message") as string).trim();
					if (message == "") return;
					(e.target as HTMLFormElement).reset();
					setMessages([
						{
							user: user2,
							time: new Date(),
							content: message,
							target: "server",
							noAvatar: false,
							groupid: randomString(),
							blocked: true

						},
						...messages,
					]);
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

function ChatSection() {
	const {
		expanded,
		setExpanded,
		showMembers,
		setShowMembers,
		messages,
		setMessages,
	} = useContext(ChatContext) as ChatContextType;
	const messageBoxRef = useRef<HTMLDivElement>(null);

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

	return (
		<div
			className={twMerge(
				"absolute inset-0 flex translate-x-full flex-col overflow-hidden rounded-r-3xl bg-gradient-to-tr from-card-300 from-40% to-card-500 transition-all @md:left-20 @md:translate-x-0",
				expanded &&
					"translate-x-0 select-none brightness-50 @md:translate-x-56",
			)}
		>
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
								<div className="text-sm">servername</div>
								<div className="text-xs text-foreground-500">
									something
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
								<Button variant="ghost" iconOnly>
									<SuperDropdown>
									<DropdownTrigger>

									<MoreHorizontal />
									</DropdownTrigger>
									<SuperDropdownMenu>
										<DropdownItem startContent={
											<Settings2/>
										}>
											Settings
										</DropdownItem>
										<DropdownItem startContent={
											<LogOut/>
										} data-exclude={true} color="danger">
											Leave
										</DropdownItem>
									</SuperDropdownMenu>
									</SuperDropdown>
								</Button>
							</div>
						</div>
					</div>
					<div className="relative flex-1">
						<div
							ref={messageBoxRef}
							className="no-scrollbar absolute inset-0 overflow-y-scroll scroll-smooth"
						>
							<div
								suppressHydrationWarning
								className="flex min-h-full flex-col-reverse gap-4 py-4 pl-2"
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
	const [listTab, setListTab] = useState<"servers" | "friends">("servers");
	const [showMembers, setShowMembers] = useState(true);
	const [expanded, setExpanded] = useState(false);
	const [members, setMembers] = useState<User[]>(
		Array.from({ length: 7 })
			.map((_, i: number) => (i % 2 == 0 ? user1 : user2))
			.sort((user1, user2) => (user1.status == "Online" ? -1 : 1)),
	);
	const [displayedMessages, setDisplayedMessages] = useState({});
	const messageParents = useRef({}) as any;

	const [messages, setMessages] = useState<Message[]>(
		Array.from({ length: 20 }).map((_, i: number) => ({
			user: i % 4 == 0 ? user1 : user2,
			time: new Date(),
			content: `Lorem ipsum dolor sit amet consectetur, adipisicing elit.
		Pariatur blanditiis totam minima voluptas natus possimus,
		consequuntur similique molestiae atque neque libero ut,
		porro quod exp delectus distinctio officiis! Sequi,
		explicabo!`,
			noAvatar: false,
			target: "server",
			groupid: randomString(),
			blocked: i % 4 != 0 ? true : false,
		})),
	);

	messageParents.current = {};

	for (let i = 0; i < messages.length; i++) {
		if (messages[i].user == messages[i + 1]?.user) {
			messages[i].noAvatar = true;
		}
		messages[i].parent = true;
		if (messageParents.current[messages[i].groupid] == undefined)
			messageParents.current[messages[i].groupid] = 1;
		if (messages[i + 1]?.blocked == messages[i]?.blocked)
			messages[i].parent = false
		if (i > 0 && messages[i].blocked == messages[i - 1].blocked)
		{
			messageParents.current[messages[i].groupid] += 1;
			messages[i].groupid = messages[i - 1].groupid;
		}
	}


	// for (let i = messages.length - 2; i >= 0; i--) {
	// 	if (messages[i].blocked == true || messages[i].blocked == messages[i + 1]?.blocked) {
	// 		messages[i].groupid = messages[i + 1]?.groupid;
	// 		if (messageParents.current[messages[i].groupid] == undefined) {
	// 			messageParents.current[messages[i].groupid] = 1;
	// 		}
	// 		else
	// 			messages[i].parent = false;
	// 		messageParents.current[messages[i].groupid] += 1;
	// 	}
	// }


	return (
		<div
			suppressHydrationWarning
			className="relative z-10 mb-12 w-5/6 overflow-hidden rounded-3xl @container"
		>
			<ChatContext.Provider
				value={{
					expanded,
					setExpanded,
					listTab,
					setListTab,
					showMembers,
					setShowMembers,
					messages,
					setMessages,
					members,
					setMembers,
					displayedMessages,
					setDisplayedMessages,
					messageParents,
				}}
			>
				<ServerList />
				<ChatSection />
			</ChatContext.Provider>
		</div>
	);
}
