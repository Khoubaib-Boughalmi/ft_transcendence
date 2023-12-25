"use client";

import {
	Bell,
	Check,
	LogIn,
	LucideIcon,
	MessageCircle,
	Search,
	UserCircle2,
	UserPlus2,
	Users2,
	X,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useEffect, useState, useContext } from "react";
import PublicContext from "@/contexts/PublicContext";
import Status from "@/components/Status";
import Input from "@/components/Input";
import { User } from "@/types/profile";
import {
	Badge,
	Divider,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownSection,
	DropdownTrigger,
	Skeleton,
	Tooltip,
} from "@nextui-org/react";
import { SuperSkeleton } from "./SuperSkeleton";
import SuperImage from "./SuperImage";
import { SuperDropdown, SuperDropdownMenu } from "./SuperDropdown";
import { useRouter } from "next/navigation";
import { cookies } from "next/headers";
import axios from "@/lib/axios";
import { twMerge } from "tailwind-merge";
import { Lock, User as UserIcon } from "lucide-react";
import {
	getFlag,
	getRank,
	makeForm,
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
} from "@/lib/utils";
import UserList from "./UserList";
import { user1 } from "@/mocks/profile";

const buttons = ["Home", "Leaderboard", "Play"] as const;

function Navigation() {
	const [active, setActive] = useState(buttons[0]) as [
		(typeof buttons)[number],
		(button: (typeof buttons)[number]) => void,
	];

	return (
		<>
			{buttons.map((button, i) => (
				<Button
					variant={button === active ? "default" : "transparent"}
					key={button}
					onClick={() => setActive(button)}
				>
					{button}
				</Button>
			))}
		</>
	);
}

function LoginButton() {
	return (
		<Button
			as="a"
			href="http://localhost:3000/api/auth/intra/login"
			startContent={<img className="h-5 w-5 invert" src="/42_Logo.svg" />}
			variant="ghost"
		>
			Sign in
		</Button>
	);
}


function FriendsButton() {
	type tabs = "requests" | "friends";
	const { session, sessionMutate } = useContext(PublicContext) as any;
	const [tab, setTab] = useState<tabs>("requests");
	const [actualTab, setActualTab] = useState<tabs>("requests");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// @ts-ignore
		document.startViewTransition(() => setActualTab(tab));
	}, [tab]);

	const handleControls = (user: User, action: "accept" | "reject") => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/user/${action}Friend`,
			makeForm({ id: user.id }),
			setLoading,
			`${action == "accept" ? "Accepted" : "Rejected"} request`,
			"Something went wrong",
			sessionMutate,
		);
	};

	return (
		<SuperDropdown closeOnSelect={false}>
			<DropdownTrigger>
				<div className="flex items-center justify-center">

				<Badge isInvisible={session.friend_requests.length == 0} content={session.friend_requests.length} color="danger" className="text-xs scale-90">

				<Users2 size={20} />
				</Badge>
				</div>
			</DropdownTrigger>
			<SuperDropdownMenu
				disabledKeys={[]}
				itemClasses={{
					base: "data-[hover=true]:bg-transparent",
				}}
			>
				<DropdownItem className="mb-2 p-0">
					<div className="flex w-full gap-2 rounded-xl">
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
									className="flex-1 flex-col gap-0 p-1 text-xs"
								>
									<Icon size={16} className="flex-shrink-0" />
									{text}
								</Button>
							);
						})}
					</div>
				</DropdownItem>
				<DropdownItem className="w-56 p-0 opacity-100">
					{actualTab == "requests" ? (
						<UserList
							type="list"
							size="xs"
							users={session.friend_requests}
							classNames={{
								list: "max-h-[70vh] overflow-y-auto",
								entry: twMerge("", loading && "opacity-50"),
							}}
							Controls={({ user }: { user: User }) => (
								<div className="flex flex-shrink-0 gap-1">
									<Button
										onClick={() =>
											handleControls(user, "accept")
										}
										disabled={loading}
										className="h-8 w-8"
										iconOnly
									>
										<Check size={12} />
									</Button>
									<Button
										onClick={() =>
											handleControls(user, "reject")
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
							classNames={{ list: "max-h-[70vh]" }}
							type="list"
							size="xs"
							users={session.friends}
						/>
					)}
				</DropdownItem>
			</SuperDropdownMenu>
		</SuperDropdown>
	);
}

function ProfileButton({ user }: { user: User }) {
	const router = useRouter();
	const { sessionMutate, fullMutate, twoFactorAuthenticated } = useContext(
		PublicContext,
	) as any;

	return (
		<SuperDropdown>
			<DropdownTrigger>
				<div className="flex h-full items-center gap-2 text-xs text-white">
					<div className="relative aspect-square h-full">
						<SuperImage
							src={user.avatar}
							className="h-full w-full rounded-full object-cover"
						/>
					</div>
				</div>
			</DropdownTrigger>
			<SuperDropdownMenu
				onAction={(item) => {
					if (item == "profile") {
						router.push("/profile");
					} else if (item == "settings") {
						router.push("/settings");
					} else if (item == "chat") {
						router.push("/chat");
					} else if (item == "logout") {
						axios.get("/auth/logout").then(async () => {
							await fullMutate();
							router.refresh();
						});
					}
				}}
			>
				<DropdownItem
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
					{twoFactorAuthenticated ? (
						<Status
							className="rounded-none px-4 text-white"
							size="sm"
							status="Online"
						/>
					) : (
						<Status size="sm" status="Offline" />
					)}
				</DropdownItem>
				<DropdownItem
					variant="solid"
					className={twMerge(!twoFactorAuthenticated && "hidden")}
					key="profile"
				>
					Profile
				</DropdownItem>
				<DropdownItem
					variant="solid"
					className={twMerge(!twoFactorAuthenticated && "hidden")}
					key="settings"
				>
					Settings
				</DropdownItem>
				<DropdownItem
					variant="solid"
					className={twMerge(!twoFactorAuthenticated && "hidden")}
					key="chat"
				>
					Chat
				</DropdownItem>
				<DropdownItem
					variant="solid"
					data-exclude={false}
					color="danger"
					key="logout"
				>
					Logout
				</DropdownItem>
			</SuperDropdownMenu>
		</SuperDropdown>
	);
}

function NotificationsButton() {
	return (
		<Dropdown>
			<DropdownTrigger>
				<Bell size={20} />
			</DropdownTrigger>
			<DropdownMenu>
				<DropdownItem>Item 1</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

function SearchBar() {
	return (
		<Input
			startContent={<Search className="text-background-800" />}
			placeholder="Search"
		/>
	);
}

export function Navbar() {
	const [solid, setSolid] = useState(false);
	const { accessToken, session, sessionLoading, twoFactorAuthenticated } =
		useContext(PublicContext) as any;

	useEffect(() => {
		const listener = () => {
			console.log("setting scroll listener");
			setSolid(window.scrollY > 25);
		};
		window.addEventListener("scroll", listener);
		listener();
		return () => window.removeEventListener("scroll", listener);
	}, []);

	console.log(sessionLoading);

	return (
		<nav
			data-solid={solid}
			className="fixed top-0 z-50 flex h-28 w-full items-center justify-center px-8
				transition-all
				duration-300 ease-in-out
				data-[solid=true]:h-16
				data-[solid=true]:px-0
				"
		>
			<div
				data-solid={solid}
				className="shadow-card/25 flex w-3/4 items-center justify-center rounded-full bg-black/50 shadow-lg transition-all
				duration-300 ease-in-out data-[solid=true]:h-full data-[solid=true]:w-full data-[solid=true]:rounded-none data-[solid=true]:bg-black
				data-[solid=true]:bg-opacity-100
				data-[solid=true]:px-8
				data-[solid=true]:backdrop-blur-sm
				"
			>
				<div className="m-2 flex h-9 w-full items-center justify-between gap-2">
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
