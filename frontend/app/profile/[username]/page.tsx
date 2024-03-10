"use client";
import { Button } from "@/components/Button";
import Card from "@/components/Card";
import Chart from "@/components/Chart";
import Divider from "@/components/Divider";
import MessageBox from "@/components/MessageBox";
import ModalSet from "@/components/ModalSet";
import NoData from "@/components/NoData";
import Status from "@/components/Status";
import SuperImage from "@/components/SuperImage";
import { SuperSkeleton } from "@/components/SuperSkeleton";
import UserList from "@/components/UserList";
import PublicContext from "@/contexts/PublicContext";
import { AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing } from "@/lib/utils";
import {
	InteractionFunctionality,
	fetcherUnsafe,
	getFlag,
	getRank,
	interactionDictionary,
} from "@/lib/utils";
import { user1 } from "@/mocks/profile";
import { Achievement, InteractionType, User } from "@/types/profile";
import { useDisclosure } from "@nextui-org/react";
import axios from "@/lib/axios";
import {
	Check,
	Expand,
	HeartHandshake,
	Medal,
	MessageSquareIcon,
	MoreHorizontal,
	Swords,
	UserMinus2,
	UserPlus2,
	UserX2,
	Video,
	X,
} from "lucide-react";
import { notFound, redirect, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import MatchHistoryList from "@/components/MatchHistoryList";
import socket from "@/lib/socket";

const ProfileContext = createContext({});

const titles = ["Overview", "Friends", "Achievements", "Stats"];

function SessionLoadingSkeleton() {
	const { userLoading } = useContext(ProfileContext) as any;

	return (
		<SuperSkeleton
			isLoaded={!userLoading}
			className="absolute inset-0 z-40 rounded-3xl"
			classNames={{
				base: "after:dark:bg-card-300 before:dark:bg-card-300 dark:bg-card-300",
			}}
		/>
	);
}

function LevelBar({
	level,
	percentage,
}: {
	level: number;
	percentage: number;
}) {
	return (
		<div className="flex h-2 w-full items-center gap-8">
			<div className="h-2 flex-1 overflow-hidden rounded-3xl bg-black ">
				<div
					style={{
						width: `${percentage}%`,
					}}
					className="h-full w-1/2 bg-gradient-to-r from-card via-accent to-primary"
				></div>
			</div>
			<div className="flex aspect-square  h-[750%] -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-accent to-card text-2xl font-bold leading-6 text-white ring-2  ring-card">
				{level}
			</div>
		</div>
	);
}

function AchievementScore({
	size,
	score,
}: {
	size?: "sm" | "md" | "lg";
	score: number;
}) {
	return (
		<div
			data-size={size}
			className="group flex items-center justify-start gap-1 text-white data-[size=sm]:gap-0 data-[size=sm]:text-xs"
		>
			<Medal className="p-0.5 group-data-[size=sm]:p-1.5" />
			{score}
		</div>
	);
}

function MatchHistoryCard({ user }: { user: User }) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	return (
		<Card
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
						scrollBehavior="outside"
						onClose={onClose}
						isOpen={isOpen}
						onOpenChange={onOpenChange}
						trigger={
							<Button
								onClick={onOpen}
								variant="transparent"
								startContent={<Expand />}
							>
								See More
							</Button>
						}
					>
						<MatchHistoryList history={user.history} />
					</ModalSet>
				</div>
			}
			className="relative"
			skeleton={<SessionLoadingSkeleton />}
			fullWidth
		>
			<MatchHistoryList history={user.history.slice(0, 3)} />
		</Card>
	);
}

function ProfileFriends({ user }: { user: User }) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	return (
		<Card
			id="Friends"
			header={"Friends"}
			className="relative"
			skeleton={<SessionLoadingSkeleton />}
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
						scrollBehavior="outside"
						onClose={onClose}
						isOpen={isOpen}
						onOpenChange={onOpenChange}
						size={"lg"}
						trigger={
							<Button
								onClick={onOpenChange}
								variant="transparent"
								startContent={<Expand />}
							>
								See More
							</Button>
						}
					>
						<div className="p-2">
							<UserList
								showHover={false}
								type="list"
								users={user.friends!}
							/>
						</div>
					</ModalSet>
				</div>
			}
			fullWidth
		>
			<div className="p-2">
				<UserList type="grid" users={user.friends!.slice(0, 7)} />
			</div>
		</Card>
	);
}

function ProfileNavigation() {
	const [tab, setTab] = useState("Overview");
	const [extended, setExtended] = useState(false);
	const tabNavRef = useRef(null) as any;
	const originalTabNavTop = useRef(-1) as any;

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 556) {
				setExtended(true);
			} else {
				setExtended(false);
			}
			const elements = Array.from(document.querySelectorAll("[id]"));
			const middle = window.innerHeight / 2;
			const closest = elements.reduce((prev, curr) => {
				const currDistance = Math.abs(
					curr.getBoundingClientRect().top - middle,
				);
				const prevDistance = Math.abs(
					prev.getBoundingClientRect().top - middle,
				);
				return currDistance < prevDistance ? curr : prev;
			});
			const closestTitle = closest.id;
			if (titles.includes(closestTitle)) {
				setTab(closestTitle);
			}
		};
		window.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			ref={tabNavRef}
			data-extended={extended}
			className="sticky top-8 z-30 flex w-full items-center justify-center gap-2 rounded-3xl bg-card p-2 transition-all duration-300 data-[extended=true]:translate-y-full"
		>
			{titles.map((title) => (
				<Button
					key={title}
					variant={tab === title ? "secondary" : "transparent"}
					onClick={() => {
						const element = document.getElementById(title);
						if (element) {
							element.scrollIntoView({
								behavior: "smooth",
								block: "center",
							});
						}
					}}
				>
					{title}
				</Button>
			))}
		</div>
	);
}

function InteractionButton({
	type,
	user,
	callback,
	...props
}: {
	type: InteractionType;
	user: User;
	callback?: any;
} & React.ComponentProps<typeof Button>) {
	const { sessionMutate } = useContext(PublicContext) as any;
	const [loading, setLoading] = useState(false);
	const [buttonText, ..._] = interactionDictionary[type];

	return (
		<Button
			loading={loading}
			onClick={() => {
				InteractionFunctionality(
					type,
					user,
					async () => {
						await sessionMutate();
						callback && callback();
					},
					setLoading,
				);
			}}
			{...props}
		>
			{buttonText}
		</Button>
	);
}

async function inviteplayer(user: User, session: any, router: any) {
	console.log("Invited", user);
	console.log("Session", session);
	const res = await axios.post("/game/invite", {
		user1: session.id,
		user2: user.id,
	});
	if (res.status == 201) {
		console.log("Invited", res.data);
		console.log("redirecting", "/game/" + res.data.id);
		// socket.emit("message", {
		// 	targetId: selectedServer?.isDM
		// 		? selectedServer.membersIds.find((id) => id != session.id)
		// 		: undefined,
		// 	chatId: selectedServerId,
		// 	queueId: newId,
		// 	message,
		// });
		socket.emit("message", {
			targetId: user.id,
			chatId: user.id,
			queueId: res.data.id,
			message: "http://localhost:8080/game/" + res.data.id,
		});

		router.push("/game/" + res.data.id);
	}

	console.log(res);
}

function ProfileTop({ user }: { user: User }) {
	const { session, onMessageOpen, setMessageTarget } = useContext(PublicContext) as any;
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const router = useRouter();
	const userBlocked = session.blocked_users.find(
		(blocked: User) => blocked.id == user.id,
	);
	const userFriends = session.friends.find(
		(friend: User) => friend.id == user.id,
	);
	const requestReceived = session.friend_requests.find(
		(request: User) => request.id == user.id,
	);
	const me = session.id == user.id;

	return (
		<div className="relative flex w-full flex-col">
			<SessionLoadingSkeleton />
			<div className="relative h-96 w-full overflow-hidden rounded-t-3xl">
				<SuperImage
					width={1280}
					height={720}
					alt="banner"
					src={user.banner}
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 z-10 flex items-end justify-end gap-2 p-8">
					{!me && (
						<>
							{!userBlocked &&
								(requestReceived ? (
									<>
										<InteractionButton
											type="accept"
											user={user}
											startContent={<Check size={18} />}
											variant="secondary"
										/>
										<InteractionButton
											type="reject"
											user={user}
											startContent={<X size={18} />}
											variant="danger"
										/>
									</>
								) : !userFriends ? (
									<InteractionButton
										type="add"
										user={user}
										startContent={<UserPlus2 size={18} />}
										variant="secondary"
									/>
								) : (
									<InteractionButton
										type="unfriend"
										user={user}
										startContent={<UserMinus2 size={18} />}
										variant="danger"
									/>
								))}
							{userBlocked && (
								<InteractionButton
									type="unblock"
									user={user}
									startContent={<HeartHandshake size={18} />}
									variant="secondary"
								/>
							)}
							{!userBlocked && (
								<>
									<ModalSet
										onClose={onClose}
										title={`Options for ${user.username}`}
										isOpen={isOpen}
										onOpenChange={onOpenChange}
										size="xs"
										trigger={
											<Button
												onClick={onOpenChange}
												variant="transparent"
												iconOnly
												startContent={
													<MoreHorizontal size={20} />
												}
											></Button>
										}
									>
										<div className="flex flex-col gap-1 p-2">
											<Button
												startContent={
													<MessageSquareIcon
														size={18}
													/>
												}
												variant="transparent"
												className="justify-start"
												onClick={() => {
													onClose();
													setMessageTarget(user);
													onMessageOpen();
												}}
											>
												Message
											</Button>
											<Button
												startContent={
													<Swords size={18} />
												}
												variant="transparent"
												className="justify-start"
												onClick={() => {
													inviteplayer(
														user,
														session,
														router,
													);
												}}
											>
												Invite
											</Button>
											<Button
												startContent={
													<Video size={18} />
												}
												variant="transparent"
												className="justify-start"
											>
												Spectate
											</Button>
											<Divider className="my-4" />

											<InteractionButton
												type="block"
												user={user}
												startContent={
													<UserX2 size={18} />
												}
												className="justify-start"
												variant="danger"
												callback={onClose}
											/>
										</div>
									</ModalSet>
								</>
							)}
						</>
					)}
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-card-300"></div>
			</div>
			<div className="z-10 flex h-24 w-full rounded-b-3xl bg-card-300 px-8">
				<div className="relative aspect-square h-[150%]">
					<SuperImage
						width={256}
						height={256}
						alt={user.username}
						className="h-full w-full -translate-y-1/2 rounded-full object-cover"
						src={user.avatar}
					/>
				</div>
				<div className="relative flex w-full translate-y-[-25%] flex-col items-start gap-4 px-2 pl-4 text-white">
					<Status userId={user.id} />
					<div className="relative h-32 w-full">
						<div className="absolute inset-0">
							<div className="flex w-full flex-col gap-2">
								<div className="-mt-2 select-all truncate pr-20 text-3xl font-bold">
									{user.username}
								</div>
								<div className="-mt-2 flex gap-2 text-xs leading-[0.5rem] ">
									<span className="font-flag">
										{getFlag(user.country)}
									</span>
									<span>{user.country}</span>
								</div>
							</div>
						</div>
					</div>
					<LevelBar
						level={user.level}
						percentage={user.level_percentage}
					/>
				</div>
			</div>
		</div>
	);
}

function ProfileGaming({ user }: { user: User }) {
	return (
		<div id="Overview" className="flex w-full flex-col gap-4 lg:flex-row">
			<div
				className={`z-10 flex aspect-video h-auto w-full flex-shrink-0 flex-col items-center justify-between overflow-hidden rounded-3xl lg:aspect-square lg:h-full lg:w-auto ${
					getRank(user.rank).color
				} relative `}
			>
				<div className="flex flex-1 flex-col items-center justify-center gap-2">
					<span
						className={`text-[10rem] font-bold leading-[8rem] text-transparent mix-blend-plus-lighter ${
							getRank(user.rank).color
						} fuck-css`}
					>
						{getRank(user.rank).name}
					</span>
					<Divider />
					<span className="text-white">Division {user.division}</span>
					<div></div>
				</div>
				<SessionLoadingSkeleton />
			</div>
			<MatchHistoryCard user={user} />
		</div>
	);
}

function AchievementsEntry({ achievement }: { achievement: Achievement }) {
	return (
		<div className="flex h-32 overflow-hidden rounded-xl bg-card-400">
			<div
				className="relative flex h-full w-2/5 flex-shrink-0 items-center
							justify-center
							rounded-full after:absolute after:inset-0 after:translate-x-1/2 after:bg-gradient-to-r after:from-transparent after:via-card-400 after:to-transparent after:content-['']"
			>
				<SuperImage
					width={256}
					height={256}
					alt={achievement.name}
					src={achievement.icon}
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="z-20 flex flex-col items-start justify-between py-2 pr-4">
				<div className="flex flex-col text-white">
					<span className="line-clamp-1">{achievement.name}</span>
					<span className="line-clamp-3 text-sm text-background-900">
						{achievement.description}
					</span>
				</div>
				<div className="flex w-full justify-between">
					<AchievementScore score={achievement.score} size="sm" />
					<span className="ml-auto text-sm">
						{new Date(achievement.date).toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}

function AchievementsList({ achievements }: { achievements: Achievement[] }) {
	return (
		<div className="w-full @container">
			{achievements.length == 0 && <NoData />}
			<div className="grid w-full gap-2 p-2 @lg:grid-cols-2 @[1024px]:grid-cols-3">
				{achievements.map((achievement, i) => (
					<AchievementsEntry key={i} achievement={achievement} />
				))}
			</div>
		</div>
	);
}

function ProfileAchievements({ user }: { user: User }) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	return (
		<Card
			id="Achievements"
			className="relative"
			skeleton={<SessionLoadingSkeleton />}
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
						scrollBehavior="outside"
						onClose={onClose}
						isOpen={isOpen}
						onOpenChange={onOpenChange}
						size="5xl"
						trigger={
							<Button
								onClick={onOpenChange}
								variant="transparent"
								startContent={<Expand />}
							>
								See More
							</Button>
						}
					>
						<AchievementsList achievements={user.achievements} />
					</ModalSet>
				</div>
			}
			header={"Achievements"}
			fullWidth
		>
			<AchievementsList achievements={user.achievements.slice(0, 3)} />
			<div className="flex flex-col gap-4 p-2 pt-4">
				<div className="h-2 w-full overflow-hidden rounded-full bg-black">
					<div
						style={{
							width: `${user.achievements_percentage}%`,
						}}
						className="h-full w-3/4 bg-secondary"
					></div>
				</div>
				<div className="flex justify-between">
					<AchievementScore
						score={user.achievements.reduce(
							(acc, curr) => acc + curr.score,
							0,
						)}
					/>
					<span className="text-xl font-medium text-white">
						{user.achievements_percentage}%
					</span>
				</div>
			</div>
		</Card>
	);
}

function ProfileStats({ user }: { user: User }) {
	return (
		<Card
			className="relative"
			skeleton={<SessionLoadingSkeleton />}
			id="Stats"
			header="Stats"
		>
			<div className="flex flex-col gap-4 p-2 ">
				<div className="grid grid-cols-4 gap-4">
					{["Wins", "Losses", "Matches", "Ratio"].map((title) => (
						<div
							key={title}
							className="relative grid h-32 w-full grid-rows-4 overflow-hidden rounded-xl bg-card-400 p-4
									after:absolute after:inset-0 after:bg-gradient-to-t after:from-card-300 after:to-transparent after:content-['']"
						>
							<div className="grid-rows-1 text-white">
								{title}
							</div>
							<div
								suppressHydrationWarning
								className="grid-row-3 text-7xl text-white"
							>
								{
									[
										user.wins,
										user.losses,
										user.matches,
										(user.wins / user.matches || 0).toFixed(
											2,
										),
									][
										[
											"Wins",
											"Losses",
											"Matches",
											"Ratio",
										].indexOf(title)
									]
								}
							</div>
						</div>
					))}
				</div>
				<div className="text-lg text-background-900 ">
					Monthly Activity
				</div>
				<Divider />

				<Chart activity={user.activity} />
			</div>
		</Card>
	);
}

export default function Home({ params }: any) {
	const { session, sessionLoading } = useContext(PublicContext) as any;
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useSWR(`/user/profile/${params.username}`, fetcherUnsafe, {
		refreshInterval: 1000,
	}) as {
		data: User;
		isLoading: boolean;
		error: any;
	};
	const falseUser = { ...user1, ...user };


	useEffect(() => {
		document.title = `${decodeURIComponent(params.username)} | Profile`
	}, [user]);

	if (userError) notFound();

	return (
		<main className="relative mb-12 flex w-[1250px] max-w-full select-none flex-col justify-center gap-4">
			<ProfileContext.Provider
				value={{ userLoading: userLoading || sessionLoading }}
			>
				<ProfileTop user={falseUser} />
				<ProfileNavigation />
				<ProfileGaming user={falseUser} />
				<ProfileFriends user={falseUser} />
				<ProfileAchievements user={falseUser} />
				<ProfileStats user={falseUser} />
			</ProfileContext.Provider>
		</main>
	);
}
