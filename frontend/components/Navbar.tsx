"use client";

import { Button } from "@/components/Button";
import Input from "@/components/Input";
import Status from "@/components/Status";
import PublicContext from "@/contexts/PublicContext";
import axios from "@/lib/axios";
import socket from "@/lib/socket";
import {
	fetcher,
	getFlag,
	getRank,
	makeForm,
	AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
	useChatContext,
	maps,
} from "@/lib/utils";
import { Message } from "@/types/chat";
import { User } from "@/types/profile";
import {
	Badge,
	Divider,
	DropdownItem,
	DropdownSection,
	DropdownTrigger,
	Spinner,
	useDisclosure,
} from "@nextui-org/react";
import {
	Bell,
	Check,
	Lock,
	LogOut,
	MessageSquareIcon,
	Paintbrush2,
	Search,
	Settings2,
	User2,
	UserPlus2,
	Users2,
	X,
	Map,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import ModalSet from "./ModalSet";
import NoData from "./NoData";
import { SuperDropdown, SuperDropdownMenu } from "./SuperDropdown";
import SuperImage from "./SuperImage";
import { SuperSkeleton } from "./SuperSkeleton";
import UserList from "./UserList";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { getCurrentPath, buttons, paths, themes } from "@/lib/utils";

function Navigation() {
	const router = useRouter();
	const pathName = usePathname();
	const current = getCurrentPath(pathName);

	return (
		<>
			<div className="flex gap-2">
				{buttons.map((name) => (
					<Button
						key={name}
						onClick={() => router.push(paths[name])}
						variant={current == name ? "default" : "transparent"}
					>
						{name}
					</Button>
				))}
			</div>
		</>
	);
}

function LoginButton() {
	return (
		<Button
			as="a"
			href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/intra/login`}
			startContent={<img className="h-5 w-5 invert" src="/42_Logo.svg" />}
			variant="ghost"
		>
			Sign in
		</Button>
	);
}

function sortObject(obj: any, func: any) {
	return Object.keys(obj)
		.sort((a, b) => func(obj[a], obj[b]))
		.reduce((acc, key) => {
			acc[key] = obj[key];
			return acc;
		}, {} as any);
}

function timeAgo(time: number) {
	const now = new Date().getTime();
	const diff = now - time;
	const seconds = diff / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;
	const days = hours / 24;
	const weeks = days / 7;
	const months = weeks / 4;
	const years = months / 12;

	if (seconds < 60) return "Just now";
	else if (minutes < 60) return `${Math.floor(minutes)}m ago`;
	else if (hours < 24) return `${Math.floor(hours)}h ago`;
	else if (days < 7) return `${Math.floor(days)}d ago`;
	else if (weeks < 4) return `${Math.floor(weeks)}w ago`;
	else if (months < 12) return `${Math.floor(months)}mo ago`;
	else return `${Math.floor(years)}y ago`;
}

function NotificationsButton() {
	const { notifications, setNotifications } = useContext(
		PublicContext,
	) as any;

	const router = useRouter();

	const { navigateToServer } = useChatContext();

	const groupedNotifications: {
		[key: string]: Message[];
	} = useMemo(() => {
		const grouped = {} as any;
		(notifications ?? []).forEach((n: Message) => {
			if (grouped[n.chatId] == undefined) grouped[n.chatId] = [];
			grouped[n.chatId].push(n);
		});
		return sortObject(grouped, (a: Message[], b: Message[]) => {
			return a[a.length - 1].createdAt < b[b.length - 1].createdAt
				? 1
				: -1;
		});
	}, [notifications]);

	return (
		<SuperDropdown aria-label="Notifications" className="w-80">
			<DropdownTrigger aria-label="Trigger">
				<div className="flex items-center justify-center">
					<Badge
						isInvisible={notifications?.length == 0}
						content={
							notifications?.length > 99
								? "99+"
								: notifications?.length
						}
						color="danger"
						className="scale-90 text-xs"
					>
						<Bell size={20} />
					</Badge>
				</div>
			</DropdownTrigger>
			<SuperDropdownMenu
				aria-label="Notifications Menu"
				onAction={(chatId: any) => {
					router.push(`/chat/channel/${chatId}`);
				}}
				disabledKeys={["info", "nodata"]}
			>
				<DropdownSection aria-label="Notifications">
					<DropdownItem
						aria-label="Notifications"
						className="opacity-100"
						key={"info"}
						isReadOnly
						startContent={<Bell size={20} />}
					>
						<div className="flex items-center justify-between">
							<div>Notifications</div>
							{notifications?.length > 0 && (
								<div className="text-xs text-foreground-500">
									{notifications?.length}
								</div>
							)}
						</div>
					</DropdownItem>
				</DropdownSection>
				<DropdownSection
					aria-label="Notifications List"
					className="mb-0 rounded-lg bg-card-275 p-2"
				>
					{Object.values(groupedNotifications)?.length == 0 ? (
						<DropdownItem
							key={"nodata"}
							className="h-24 opacity-100"
							isReadOnly
						>
							<NoData />
						</DropdownItem>
					) : (
						Object.values(groupedNotifications)?.map(
							(messages: Message[], index: number) => {
								const last = messages[messages.length - 1];
								const isLast =
									index ==
									Object.values(groupedNotifications).length -
										1;
								return (
									<DropdownItem
										key={last.chatId}
										aria-label={
											last.chatInfo?.name ?? "User"
										}
										className={twMerge(
											"p-0",
											!isLast && "mb-2",
										)}
									>
										<div className="flex flex-col overflow-hidden rounded-lg">
											<div className="flex h-12 w-full gap-2 p-2">
												<div className="relative aspect-square h-full shrink-0">
													<SuperImage
														src={
															last.chatInfo
																?.icon ??
															last.user.avatar
														}
														width={32}
														height={32}
														alt={last.user.username}
														className={twMerge(
															"absolute inset-0 h-full w-full rounded-full object-cover",
															last.chatInfo &&
																"rounded-lg",
														)}
													/>
												</div>
												<div className="flex flex-1 flex-col overflow-hidden">
													<div className="flex justify-between text-xs leading-3 text-foreground-500">
														<div className="truncate">
															{last.chatInfo
																?.name ??
																last.user
																	.username}
														</div>
														{messages.length >
															1 && (
															<div className="text-foreground-500">
																+
																{messages.length -
																	1}
															</div>
														)}
													</div>
													<p className="truncate">
														{last.chatInfo && (
															<span className="mr-1 text-xs text-foreground-600">
																{
																	last.user
																		.username
																}
																:
															</span>
														)}
														<span className="text-foreground-700">
															{last.content}
														</span>
													</p>
												</div>
											</div>
											<div className="flex w-full justify-end bg-black/75 px-2 py-1 text-xs leading-4">
												{timeAgo(
													new Date(
														last.createdAt,
													).getTime(),
												)}
											</div>
										</div>
									</DropdownItem>
								);
							},
						)
					)}
				</DropdownSection>
			</SuperDropdownMenu>
		</SuperDropdown>
	);
}

function FriendsButton() {
	type tabs = "requests" | "friends";
	const { session, sessionMutate } = useContext(PublicContext) as any;
	const [tab, setTab] = useState<tabs>("requests");
	const [loading, setLoading] = useState(false);
	const [closeOnSelect, setCloseOnSelect] = useState(true);

	const handleControls = (user: User, action: "accept" | "reject") => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/user/${action}Friend`,
			makeForm({ id: user.id }),
			setLoading,
			`${action == "accept" ? "Accepted" : "Rejected"} request`,
			"Something went wrong",
			sessionMutate,
		);
	};

	return (
		<SuperDropdown aria-label="Social" closeOnSelect={closeOnSelect}>
			<DropdownTrigger aria-label="Trigger">
				<div className="flex items-center justify-center">
					<Badge
						isInvisible={session.friend_requests.length == 0}
						content={
							session.friend_requests.length > 99
								? "99+"
								: session.friend_requests.length
						}
						color="danger"
						className="scale-90 text-xs"
					>
						<Users2 size={20} />
					</Badge>
				</div>
			</DropdownTrigger>
			<SuperDropdownMenu
				aria-label="Social Menu"
				disabledKeys={["info"]}
				itemClasses={{
					base: "data-[hover=true]:bg-transparent",
				}}
			>
				<DropdownSection aria-label="Notifications">
					<DropdownItem
						aria-label="Notifications"
						className="opacity-100"
						key={"info"}
						isReadOnly
						startContent={<Users2 size={20} />}
					>
						<div className="flex items-center justify-between">
							<div>Social</div>
						</div>
					</DropdownItem>
				</DropdownSection>
				<DropdownItem
					onMouseEnter={() => setCloseOnSelect(false)}
					aria-label="Controls"
					className="mb-2 p-0"
				>
					<div className="flex w-full gap-2 overflow-hidden rounded-3xl bg-card-200">
						{[
							[Users2, "Friends"],
							[UserPlus2, "Requests"],
						].map((item: any) => {
							const [Icon, text] = item;
							return (
								<Button
									onClick={() => setTab(text.toLowerCase())}
									key={text}
									iconOnly
									variant={
										tab == text.toLowerCase()
											? undefined
											: "transparent"
									}
									className="flex-1 flex-col gap-0 rounded-none p-1 text-xs"
								>
									<Icon size={16} className="flex-shrink-0" />
									{text}
								</Button>
							);
						})}
					</div>
				</DropdownItem>
				<DropdownItem
					aria-label="List"
					className="w-56 p-0 opacity-100"
				>
					<AnimatePresence mode="popLayout">
						<motion.div
							initial={{ x: 10, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -10, opacity: 0 }}
							transition={{ duration: 0.2 }}
							key={tab}
						>
							{tab == "requests" ? (
								<UserList
									showHover={false}
									type="list"
									size="xs"
									users={session.friend_requests}
									classNames={{
										list: "max-h-[70vh] overflow-y-auto",
										entry: twMerge(
											"",
											loading && "opacity-50",
										),
									}}
									entryProps={{
										onMouseEnter: () =>
											setCloseOnSelect(true),
									}}
									endContent={({ user }) => (
										<div
											className="flex flex-shrink-0 gap-1"
											onMouseEnter={() =>
												setCloseOnSelect(false)
											}
										>
											<Button
												onClick={() =>
													handleControls(
														user,
														"accept",
													)
												}
												disabled={loading}
												className="h-8 w-8"
												iconOnly
											>
												<Check size={12} />
											</Button>
											<Button
												onClick={() =>
													handleControls(
														user,
														"reject",
													)
												}
												disabled={loading}
												className="h-8 w-8"
												variant="danger"
												iconOnly
											>
												<X size={12} />
											</Button>
										</div>
									)}
								/>
							) : (
								<UserList
									showHover={false}
									classNames={{ list: "max-h-[70vh]" }}
									type="list"
									size="xs"
									users={session.friends}
									entryProps={{
										onMouseEnter: () =>
											setCloseOnSelect(true),
									}}
								/>
							)}
						</motion.div>
					</AnimatePresence>
				</DropdownItem>
			</SuperDropdownMenu>
		</SuperDropdown>
	);
}

function ChangeMap(user, map) {
	axios.post("/user/changeMap", makeForm({ map: map }));
}

function ProfileButton({ user }: { user: User }) {
	const [mounted, setMounted] = useState(false);

	const router = useRouter();
	const { sessionMutate, fullMutate, twoFactorAuthenticated } = useContext(
		PublicContext,
	) as any;
	const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
	const {
		isOpen: mapIsOpen,
		onClose: mapOnClose,
		onOpen: mapOnOpen,
		onOpenChange: mapOnOpenChange,
	} = useDisclosure();
	const { theme, setTheme } = useTheme();

	const currentPath = getCurrentPath(usePathname());

	useEffect(() => setMounted(true), []);

	return (
		<>
			<ModalSet
				isOpen={isOpen}
				onClose={onClose}
				size="xs"
				title={"Theme"}
				onOpenChange={onOpenChange}
			>
				<div className="flex flex-col gap-2 p-2">
					{mounted &&
						themes.map((t) => (
							<Button
								key={t.name}
								variant={
									theme == t.name.toLowerCase()
										? undefined
										: "transparent"
								}
								onClick={() => setTheme(t.name.toLowerCase())}
								className="w-full"
							>
								{t.name}
							</Button>
						))}
				</div>
			</ModalSet>
			<ModalSet
				isOpen={mapIsOpen}
				onClose={mapOnClose}
				size="xs"
				title={"Map"}
				onOpenChange={mapOnOpenChange}
			>
				<div className="flex flex-col gap-2 p-2">
					{mounted &&
						maps.map((t) => (
							<Button
								key={t.name}
								variant={
									theme == t.name.toLowerCase()
										? undefined
										: "transparent"
								}
								onClick={() => {
									ChangeMap(user, t.name.toLowerCase());
									mapOnClose();
								}}
								className="w-full"
							>
								{t.name}
							</Button>
						))}
				</div>
			</ModalSet>
			<SuperDropdown aria-label="Profile Dropdown">
				<DropdownTrigger aria-label="Avatar">
					<div
						className={twMerge(
							"flex h-full items-center gap-2 rounded-full text-xs text-white",
							currentPath == "Settings" &&
								"ring-2 ring-primary-500",
						)}
					>
						<div className="relative aspect-square h-full">
							<SuperImage
								width={32}
								height={32}
								alt="Avatar"
								src={user.avatar}
								className="h-full w-full rounded-full object-cover"
							/>
						</div>
					</div>
				</DropdownTrigger>
				<SuperDropdownMenu
					aria-label="Profile Menu"
					onAction={(item) => {
						if (item == "profile") {
							router.push("/profile");
						} else if (item == "settings") {
							router.push("/settings");
						} else if (item == "chat") {
							router.push("/chat/discover");
						} else if (item == "logout") {
							axios.get("/auth/logout").then(async () => {
								await fullMutate();
								socket.disconnect();
								router.refresh();
							});
						} else if (item == "theme") {
							onOpen();
						} else if (item == "map") {
							mapOnOpen();
						}
					}}
				>
					{twoFactorAuthenticated && (
						<DropdownItem
							aria-label="Status"
							showDivider
							key={"info"}
							variant="solid"
							className="relative overflow-hidden rounded-xl bg-black/25 p-0 opacity-100"
							isReadOnly
						>
							<div className="flex">
								<div
									className={`h-12 w-1/3 flex-shrink-0 ${
										getRank(user.rank).color
									} flex items-center justify-center`}
								>
									<span
										className={`text-transparent ${
											getRank(user.rank).color
										} fuck-css text-2xl mix-blend-plus-lighter`}
									>
										{getRank(user.rank).name}
									</span>
								</div>
								<div className="flex flex-1 flex-col items-center justify-center text-foreground-600">
									<div className="font-medium leading-3">
										{user.username}
									</div>
									<div className="flex gap-2 text-[0.65rem] leading-[0.65rem]">
										<div className="font-flag">
											{getFlag(user.country)}
										</div>
										<div>{user.country}</div>
									</div>
								</div>
							</div>
							<Status
								className="rounded-none px-4 text-white"
								size="sm"
								userId={user.id}
							/>
						</DropdownItem>
					)}
					<DropdownItem
						aria-label="Profile"
						variant="solid"
						className={twMerge(!twoFactorAuthenticated && "hidden")}
						key="profile"
						startContent={<User2 />}
					>
						Profile
					</DropdownItem>
					<DropdownItem
						aria-label="Settings"
						variant="solid"
						className={twMerge(!twoFactorAuthenticated && "hidden")}
						key="settings"
						startContent={<Settings2 />}
					>
						Settings
					</DropdownItem>
					{/* <DropdownItem
						aria-label="Chat"
						variant="solid"
						className={twMerge(!twoFactorAuthenticated && "hidden")}
						key="chat"
						startContent={<MessageSquareIcon />}
					>
						Chat
					</DropdownItem> */}
					<DropdownItem
						variant="solid"
						key="theme"
						startContent={<Paintbrush2 />}
					>
						Theme
					</DropdownItem>
					<DropdownItem
						variant="solid"
						key="map"
						startContent={<Map />}
					>
						Map
					</DropdownItem>
					<DropdownItem
						aria-label="Logout"
						variant="solid"
						data-exclude={false}
						color="danger"
						key="logout"
						startContent={<LogOut />}
					>
						Logout
					</DropdownItem>
				</SuperDropdownMenu>
			</SuperDropdown>
		</>
	);
}

function SearchBar() {
	const { session } = useContext(PublicContext) as any;
	const [active, setActive] = useState(false);
	const [entered, setEntered] = useState(false);
	const [query, setQuery] = useState("");
	const [realQuery, setRealQuery] = useState("");
	const [lastQuery, setLastQuery] = useState("");
	const { data, isLoading, isValidating, mutate } = useSWR(
		realQuery?.trim().length > 0 ? `/user/search/${realQuery}` : null,
		fetcher,
	) as any;

	const showLoading =
		isLoading || (isValidating && (!data || data.length == 0));

	const result = data?.slice(0, 5) || [];

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		const transition = (fnc: any) => {
			// const doc = document as any;
			// if (doc.startViewTransition) doc.startViewTransition(fnc);
			// else
			fnc();
		};

		if (query.length == 0) {
			transition(() => {
				setRealQuery("");
				mutate([]);
			});
		} else
			timeout = setTimeout(
				() => {
					transition(() => {
						setRealQuery(query);
					});
				},
				realQuery.length == 0 ? 0 : 500,
			);
		return () => clearTimeout(timeout);
	}, [query, realQuery.length, mutate]);

	return (
		<>
			{active && (
				<div className="absolute inset-0 h-screen animate-overlay bg-black/50"></div>
			)}
			<div className="relative h-full flex-1">
				<Input
					onFocus={() => setActive(true)}
					onBlur={() => setActive(false)}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					classNames={{
						container: "h-full",
					}}
					startContent={<Search className="text-background-800" />}
					placeholder="Search for users"
				/>
				<div
					data-focused={active}
					className={twMerge(
						`absolute -bottom-2 hidden w-full translate-y-full animate-overlayfast rounded-3xl bg-card-300 p-2
					transition-all active:block data-[focused=true]:block`,
					)}
				>
					{showLoading ? (
						<div className="flex h-32 w-full items-center justify-center">
							<Spinner />
						</div>
					) : query.length > 0 ? (
						<UserList
							showHover={false}
							type="list"
							classNames={{
								entryContainer:
									"bg-transparent hover:bg-card-400 rounded-3xl py-2 pr-2",
								entry: "truncate hover:scale-[99%]",
								list: "gap-2",
							}}
							endContent={({ user }) => {
								const areFriends = session.friends.some(
									(f: any) => f.id == user.id,
								);

								return (
									<div>
										{areFriends ? (
											<div className="flex h-full select-none items-center justify-center gap-2 rounded-2xl bg-card-200 px-6 text-xs">
												<Users2 size={16} />
												Friends
											</div>
										) : (
											<></>
										)}
									</div>
								);
							}}
							users={result}
						/>
					) : (
						<div className="flex h-32 items-center justify-center">
							<div className="text-sm">
								Search for users by username
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export function Navbar() {
	const [solid, setSolid] = useState(false);
	const { accessToken, session, sessionLoading, twoFactorAuthenticated } =
		useContext(PublicContext) as any;
	const currentPath = getCurrentPath(usePathname());

	useEffect(() => {
		const listener = () => {
			setSolid(window.scrollY > 25);
		};
		window.addEventListener("scroll", listener);
		listener();
		return () => window.removeEventListener("scroll", listener);
	}, []);

	return (
		<nav
			data-solid={solid}
			className={twMerge(
				`fixed top-0 z-50 flex h-28 w-screen items-center justify-center px-8
				transition-all
				duration-300 ease-in-out
				data-[solid=true]:h-16
				data-[solid=true]:px-0
				`,
				currentPath == "Test" && "-translate-y-full",
			)}
		>
			<div
				data-solid={solid}
				className="flex w-3/4 items-center justify-center rounded-full bg-black/50 shadow-lg shadow-card/25 transition-all
				duration-300 ease-in-out data-[solid=true]:h-full data-[solid=true]:w-full data-[solid=true]:rounded-none data-[solid=true]:bg-black
				data-[solid=true]:bg-opacity-100
				data-[solid=true]:px-8
				data-[solid=true]:backdrop-blur-sm
				"
			>
				<div className="m-2 flex h-9 w-full items-center justify-between gap-2">
					<Link
						href={"/"}
						className="flex aspect-square h-full select-none items-center justify-center rounded-full bg-card-400 font-black text-card-600 ring-0 ring-card-500 transition-all hover:shadow-LE hover:ring-2 hover:brightness-150"
					>
						LE
					</Link>
					<div className="flex h-full flex-1 items-center justify-start gap-2">
						{twoFactorAuthenticated ? (
							<SearchBar />
						) : (
							<div className="flex items-center gap-4">
								<Lock className="ml-4" />
								<div className="text-sm">
									Please login to access this page.
								</div>
							</div>
						)}
					</div>
					<div className="flex h-full flex-1 items-center justify-center gap-2">
						{twoFactorAuthenticated && <Navigation />}
					</div>
					<div className="flex h-full flex-1 items-center justify-end gap-4">
						<div className="flex h-full items-center	 gap-2 rounded-full bg-card-300 p-2 px-2">
							<FriendsButton />
							<Divider orientation="vertical" />
							<NotificationsButton />
						</div>
						<div className="relative h-full max-w-full">
							<SuperSkeleton
								isLoaded={!sessionLoading}
								className="absolute inset-y-0 right-0 z-10 w-48 rounded-full "
							/>
							{accessToken ? (
								<ProfileButton user={session} />
							) : (
								<LoginButton />
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
