"use client";
import { Button } from "@/components/Button";
import { Equal, Expand, Medal, UserPlus2, UserX2, X } from "lucide-react";
import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react";
import Divider from "@/components/Divider";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Tooltip,
} from "@nextui-org/react";
import Chart from "@/components/Chart";
import Card from "@/components/Card";
import { Rank, User, Match, Achievement, Status } from "@/types/profile";
import UserHover from "@/components/UserHover";
import { getFlag } from "@/lib/utils";
import { RANKS } from "@/lib/utils";

function NoData() {
	return (
		<div className="flex h-32 max-h-full w-full items-center justify-center text-white opacity-50">
			no maidens?
		</div>
	);
}

const activities = [100, 0, 5, 10, 15, 20, 0, 0, 0, 0, 12, 18];

const user1: User = {
	id: 1,
	username: "mcharrad",
	profile_picture: "/pfp.png",
	banner: "/background2.png",
	country: "Morocco",
	level: 1,
	level_percentage: 0,
	wins: 0,
	losses: 0,
	matches: 0,
	achievements_percentage: 0,
	rank: RANKS[0],
	division: "I",
	status: "Online",

	history: [] as Match[],
	achievements: [] as Achievement[],
	activity: Array.from({ length: 12 }).map((_, i) => 0) as number[],
};

const user2: User = {
	id: 2,
	username: "mrian",
	profile_picture: "/mrian.jpeg",
	banner: "/background2.png",
	country: "China",
	level: 1,
	level_percentage: 50,
	wins: 10,
	losses: 5,
	matches: 15,
	achievements_percentage: 50,
	rank: RANKS[0],
	division: "II",
	status: "Offline",

	history: [] as Match[],
	achievements: [] as Achievement[],
	activity: activities,
};

const history: Match[] = Array.from({ length: 30 }).map((_, i) => ({
	id: i,
	user1: user1,
	user2: user2,
	result: ["win", "lose", "tie"][i % 3] as any,
	duration: 300,
	date: new Date(),
	type: "Classic",
	league: "Ranked",
	map: "The Arena",
	score1: 5,
	score2: 0,
}));

const achievements: Achievement[] = Array.from({ length: 30 }).map((_, i) => ({
	id: i,
	name: "Achievement " + i,
	description:
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.",
	icon: "/pfp.png",
	date: new Date(),
	score: 100,
}));

function Status({
	status,
	size,
}: {
	status: Status;
	size?: "sm" | "md" | "lg";
}) {
	return (
		<div
			data-size={size}
			data-status={status}
			className="group flex items-center gap-1 rounded-3xl bg-green-600 
				px-1
				text-[0.65rem]
				 data-[status=Busy]:bg-red-600 data-[status=Offline]:bg-gray-600 data-[size=sm]:text-[0.55rem]"
		>
			<div
				className="aspect-square h-2 w-2 rounded-full
				bg-green-400
				group-data-[status=Busy]:bg-red-400
				 group-data-[status=Offline]:bg-gray-400"
			></div>
			<div className="group-data-[size=sm]:leading-4">{status}</div>
		</div>
	);
}

user1.history = history;
user1.achievements = achievements;
user2.history = history;
user2.achievements = achievements;

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

function UserList({ users }: { users: User[] }) {
	return (
		<div className="w-full p-2 @container">
			{users.length == 0 && <NoData />}
			<div className="flex flex-col flex-wrap gap-2 @4xl:grid @4xl:grid-cols-7">
				{users.map((user, i) => (
					<Tooltip content={<UserHover user={user} />} key={i}>
						<div
							data-status={user.status}
							className="flex h-16 w-full items-center gap-4 overflow-hidden rounded-xl bg-card-400 p-2 text-white data-[status=Offline]:after:content:[''] relative data-[status=Offline]:after:absolute data-[status=Offline]:after:inset-0 data-[status=Offline]:after:bg-black/50
							@4xl:aspect-square @4xl:h-auto @4xl:flex-col @4xl:justify-center @4xl:gap-1
							"
						>
							<div className="aspect-square h-full overflow-hidden rounded-full @4xl:h-3/5">
								<img
									src={user.profile_picture}
									className="h-full w-full object-cover"
								/>
							</div>
							<div
								className={`absolute right-4 flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-sm shadow-black @4xl:left-[20%] @4xl:right-auto @4xl:top-[10%] @4xl:h-6 @4xl:w-6 @4xl:text-base  ${user.rank.color}`}
							>
								<span
									className={`text-transparent mix-blend-plus-lighter ${user.rank.color} fuck-css`}
								>
									{user.rank.name}
								</span>
							</div>
							<div className="flex flex-col items-start text-sm text-white @4xl:items-center ">
								{user.username}
								<Status status={user.status} size="sm" />
							</div>
						</div>
					</Tooltip>
				))}
			</div>
		</div>
	);
}

function ModalSet({
	children,
	trigger,
	title,
	isOpen,
	onOpenChange,
	onClose,
	size,
}: {
	children?: ReactNode;
	trigger?: ReactNode;
	title?: ReactNode;
	isOpen: boolean;
	onOpenChange: ComponentProps<typeof Modal>["onOpenChange"];
	onClose: ComponentProps<typeof Modal>["onClose"];
	size?: ComponentProps<typeof Modal>["size"];
}) {
	return (
		<>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				scrollBehavior="outside"
				hideCloseButton
				placement="center"
				size={size ?? "4xl"}
			>
				<ModalContent className="bg-transparent shadow-none">
					<Card
						header={
							<div className="flex w-full items-center justify-between">
								{title}
								<div className="ml-auto">
									<Button
										iconOnly
										startContent={<X />}
										variant="danger"
										onClick={onClose}
									></Button>
								</div>
							</div>
						}
						fullWidth
					>
						{children}
					</Card>
				</ModalContent>
			</Modal>
			{trigger}
		</>
	);
}

function MatchHistoryEntry({ match }: { match: Match }) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	const PlayerSide = ({
		user,
		side,
	}: {
		user: User;
		side: "left" | "right";
	}) => {
		return (
			<div className="relative flex flex-1 gap-2 overflow-hidden p-2">
				<img
					src={user.banner}
					className="absolute inset-0 h-full w-full scale-150 object-cover blur-sm brightness-50"
				/>
				<div
					data-side={side}
					className="z-10 flex w-full items-center gap-4 text-white data-[side=right]:flex-row-reverse"
				>
					<div className="aspect-square h-full overflow-hidden rounded-full">
						<img
							src={user.profile_picture}
							className="h-full w-full"
						/>
					</div>
					<div
						data-side={side}
						className="flex flex-col  items-start gap-0.5 data-[side=right]:items-end"
					>
						<span className="text-lg font-medium leading-4">
							{user.username}
						</span>
						<span
							data-side={side}
							className="flex items-center justify-center gap-1 text-[0.65rem] leading-3 text-background-900 data-[side=right]:flex-row-reverse"
						>
							<span className="font-flag">
								{getFlag(user.country)}
							</span>
							<span>{user.country}</span>
						</span>
					</div>
				</div>
			</div>
		);
	};

	const PlayerSideExtendend = ({
		user,
		side,
		score,
	}: {
		user: User;
		side: "left" | "right";
		score: number;
	}) => {
		return (
			<div
				data-side={side}
				className="group relative w-1/2
			after:absolute after:inset-0 after:top-1/2 after:bg-gradient-to-b after:from-transparent after:to-red-600 after:content-['']
				group-data-[result=tie]:after:to-yellow-600 group-data-[result=win]:after:to-green-600
			"
			>
				<img src={user.banner} className="h-full w-full object-cover" />
				<div className="absolute inset-0 z-10 flex items-center justify-between p-16 group-data-[side=right]:flex-row-reverse">
					<div className="aspect-square h-full overflow-hidden rounded-full">
						<img
							src={user.profile_picture}
							className="h-full w-full"
						/>
					</div>
					<div className="text-4xl text-white">{score}</div>
				</div>
			</div>
		);
	};

	const Information = ({ title, value }: any) => {
		return (
			<div className="flex items-center justify-between rounded-full bg-white/25 p-1 px-4 text-xs text-white">
				<span>{title}</span>
				<span className="text-sm">{value}</span>
			</div>
		);
	};

	const UserInformation = ({
		user,
		side,
	}: {
		user: User;
		side: "left" | "right";
	}) => {
		return (
			<div
				data-side={side}
				className="group flex flex-1 gap-2 data-[side=right]:flex-row-reverse"
			>
				<div
					className={`flex aspect-square h-full items-center justify-center rounded-full ${user.rank.color}`}
				>
					<div
						className={`text-transparent ${user.rank.color} fuck-css mix-blend-plus-lighter`}
					>
						{user.rank.name}
					</div>
				</div>
				<div className="flex flex-col">
					<span className="leading-4">{user.username}</span>
					<span className="flex gap-2 text-[0.55rem] leading-3 group-data-[side=right]:flex-row-reverse">
						<span className="font-flag">
							{getFlag(user.country)}
						</span>
						{user.country}
					</span>
				</div>
			</div>
		);
	};

	return (
		<ModalSet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={onClose}
			trigger={
				<div
					onClick={onOpen}
					className="relative flex h-16 w-full  cursor-pointer select-none overflow-hidden rounded-3xl bg-black brightness-90 transition-all @container hover:scale-105 hover:brightness-110"
				>
					<PlayerSide user={match.user1} side={"left"} />
					<PlayerSide user={match.user2} side={"right"} />
					<div
						data-result={match.result}
						className="absolute inset-0 flex items-center justify-center  gap-4 bg-gradient-to-r from-transparent via-green-500 to-transparent p-4 text-white data-[result=lose]:via-red-600 data-[result=tie]:via-yellow-400"
					>
						<Divider orientation="vertical" />
						<span className="flex aspect-square h-full items-center justify-center">
							{match.score1}
						</span>
						<div className=" flex aspect-square items-center justify-center rounded-full bg-white/25 p-2">
							{match.result == "win" ? (
								<Medal size={28} />
							) : match.result == "lose" ? (
								<X size={28} />
							) : (
								<Equal size={28} />
							)}
						</div>
						<span className="flex aspect-square h-full items-center justify-center">
							{match.score2}
						</span>
						<Divider orientation="vertical" />
					</div>
				</div>
			}
		>
			<div
				data-result={match.result}
				className="group relative aspect-video w-full overflow-hidden rounded-xl bg-red-600
				after:absolute after:inset-0 after:top-1/2 after:bg-gradient-to-b after:from-transparent after:to-red-800 after:content-['']
				data-[result=tie]:bg-yellow-600 data-[result=win]:bg-green-600
				data-[result=tie]:after:to-yellow-800 data-[result=win]:after:to-green-800
			"
			>
				<div
					className="relative flex h-1/2
						after:absolute after:inset-0 after:inset-x-[-10%] after:bg-gradient-to-r after:from-transparent after:via-red-600 after:to-transparent after:content-['']
						group-data-[result=tie]:after:via-yellow-600 group-data-[result=win]:after:via-green-600
					"
				>
					<div className="absolute inset-0 z-10 flex items-center  justify-center p-24">
						<div className="flex aspect-square h-full items-center justify-center rounded-full bg-white/25 p-4 text-white">
							{match.result == "win" ? (
								<Medal size={28} />
							) : match.result == "lose" ? (
								<X size={28} />
							) : (
								<Equal size={28} />
							)}
						</div>
					</div>
					<PlayerSideExtendend
						user={match.user1}
						side="left"
						score={match.score1}
					/>
					<PlayerSideExtendend
						user={match.user2}
						side="right"
						score={match.score2}
					/>
				</div>
				<div className="absolute inset-0 top-[35%]  z-10 flex flex-col justify-end gap-2 px-8 pb-8">
					<div className="mb-4 flex w-full justify-between rounded-xl bg-black/25 p-2 px-4 text-white">
						<UserInformation user={match.user1} side="left" />
						<UserInformation user={match.user2} side="right" />
					</div>
					<Information title="Type" value={match.type} />
					<Information title="Map" value={match.map} />
					<Information title="League" value={match.league} />
					<Information title="Duration" value={match.duration} />
					<Information
						title="Date"
						value={new Date(match.date).toLocaleDateString()}
					/>
				</div>
			</div>
		</ModalSet>
	);
}

function MatchHistoryList({ history }: { history: Match[] }) {
	return (
		<div className="relative grid h-full grid-cols-1 grid-rows-matches flex-col gap-2">
			{history.length == 0 && (
				<>
					<div></div>
					<NoData />
				</>
			)}
			{history.map((match: Match, i) => (
				<MatchHistoryEntry key={i} match={match} />
			))}
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
			fullWidth
		>
			<MatchHistoryList history={user.history.slice(0, 3)} />
		</Card>
	);
}

function ProfileFriends({ user }: { user: User }) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const friends = Array.from({ length: 10 })
		.map((_, i) => ({
			...(i % 2 == 0 ? user1 : user2),
		}))
		.sort((user1, user2) => (user1.status == "Offline" ? 1 : -1));

	return (
		<Card
			id="Friends"
			header={"Friends"}
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
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
						<UserList users={friends} />
					</ModalSet>
				</div>
			}
			fullWidth
		>
			<UserList users={friends.slice(0, 7)} />
		</Card>
	);
}

function ProfileNavigation() {
	const [tab, setTab] = useState("Overview");
	const [extended, setExtended] = useState(false);
	const tabNavRef = useRef(null) as any;
	const originalTabNavTop = useRef(-1) as any;
	const titles = ["Overview", "Friends", "Achievements", "Stats"];

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
	}, [tabNavRef.current]);

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

function ProfileTop({ user }: { user: User }) {
	return (
		<div className="flex w-full flex-col">
			<div className="relative h-96 w-full overflow-hidden rounded-t-3xl">
				<img src={user.banner} className="h-full w-full object-cover" />
				<div className="absolute inset-0 z-10 flex items-end justify-end gap-2 p-8">
					<Button startContent={<UserPlus2 />} variant="secondary">
						Add Friend
					</Button>
					<Button startContent={<UserX2 />} variant="danger">
						Block User
					</Button>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-card-300"></div>
			</div>
			<div className="z-10 flex h-24 w-full rounded-b-3xl bg-card-300 px-8">
				<div className="aspect-square h-[150%]">
					<img
						className="-translate-y-1/2 rounded-full object-cover"
						src={user.profile_picture}
					/>
				</div>
				<div className="relative flex w-full translate-y-[-25%] flex-col items-start gap-4 px-2 pl-4 text-white">
					<Status status={user.status} />
					<div className="flex w-full flex-col gap-2">
						<div className="text-3xl font-bold leading-5">
							{user.username}
						</div>
						<div className="flex gap-2 text-xs leading-[0.5rem]">
							<span className="font-flag">
								{getFlag(user.country)}
							</span>
							<span>{user.country}</span>
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
				className={`z-10 flex aspect-video h-auto w-full flex-shrink-0 select-none flex-col items-center justify-between overflow-hidden rounded-3xl lg:aspect-square lg:h-full lg:w-auto ${user.rank.color} `}
			>
				<div className="flex flex-1 flex-col items-center justify-center gap-2">
					<span
						className={`text-[10rem] font-bold leading-[8rem] text-transparent mix-blend-plus-lighter ${user.rank.color} fuck-css`}
					>
						{user.rank.name}
					</span>
					<Divider />
					<span className="text-white">Division {user.division}</span>
					<div></div>
				</div>
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
				<img
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
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
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
		<Card id="Stats" header="Stats">
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

export default function Home() {
	const session: User = user1;

	return (
		<main className="mb-12 flex w-[1250px] max-w-full flex-col justify-center gap-4">
			<ProfileTop user={session} />
			<ProfileNavigation />
			<ProfileGaming user={session} />
			<ProfileFriends user={session} />
			<ProfileAchievements user={session} />
			<ProfileStats user={session} />
		</main>
	);
}
