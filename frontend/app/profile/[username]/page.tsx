"use client";
import { Button } from "@/components/Button";
import { Equal, Expand, Medal, UserPlus2, UserX2, X } from "lucide-react";
import { useContext, useEffect, useRef, useState, createContext } from "react";
import Divider from "@/components/Divider";
import { useDisclosure, Tooltip, Skeleton } from "@nextui-org/react";
import Chart from "@/components/Chart";
import Card from "@/components/Card";
import { User, Match, Achievement, StatusType } from "@/types/profile";
import UserHover from "@/components/UserHover";
import { fetcher, getFlag, getRank } from "@/lib/utils";
import { dummyUser, user1, user2 } from "@/mocks/profile";
import ModalSet from "@/components/ModalSet";
import PublicContext from "@/contexts/PublicContext";
import { SuperSkeleton } from "@/components/SuperSkeleton";
import Status from "@/components/Status";
import useSWR from "swr";
import Error from "next/error";
import SuperImage from "@/components/SuperImage";
import NoData from "@/components/NoData";
import UserList from "@/components/UserList"

const ProfileContext = createContext({});

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

				<SuperImage
					src={user.banner}
					className="absolute inset-0 h-full w-full scale-150 object-cover blur-sm brightness-50"
					/>
				<div
					data-side={side}
					className="z-10 flex w-full items-center gap-4 text-white data-[side=right]:flex-row-reverse"
				>
					<div className="aspect-square h-full overflow-hidden rounded-full relative">
						<SuperImage src={user.avatar} className="h-full w-full" />
					</div>
					<div
						data-side={side}
						className="flex flex-col  items-start gap-0.5 data-[side=right]:items-end"
					>
						<span className="text-lg font-medium leading-4 select-all">
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
				<SuperImage src={user.banner} className="h-full w-full object-cover" />
				<div className="absolute inset-0 z-10 flex items-center justify-between p-16 group-data-[side=right]:flex-row-reverse">
					<div className="aspect-square h-full overflow-hidden rounded-full relative">
						<SuperImage src={user.avatar} className="h-full w-full" />
					</div>
					<div className="text-4xl text-white">{score}</div>
				</div>
			</div>
		);
	};

	const Information = ({ title, value }: any) => {
		return (
			<div className="flex items-center justify-between rounded-full bg-white/10 p-1 px-4 text-xs text-white">
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
					className={`flex aspect-square h-full items-center justify-center rounded-full ${
						getRank(user.rank).color
					}`}
				>
					<div
						className={`text-transparent ${
							getRank(user.rank).color
						} fuck-css mix-blend-plus-lighter`}
					>
						{getRank(user.rank).name}
					</div>
				</div>
				<div className="flex flex-col">
					<span className="leading-4 select-all">{user.username}</span>
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
					className="relative flex h-16 w-full  cursor-pointer overflow-hidden rounded-3xl bg-black brightness-90 transition-all @container hover:scale-105 hover:brightness-110"
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
					<div className="mb-4 flex w-full justify-between rounded-full bg-black/25 p-2 px-2 text-white">
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
						<UserList users={user.friends!} />
					</ModalSet>
				</div>
			}
			fullWidth
		>
			<UserList users={user.friends!.slice(0, 7)} />
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
		<div className="relative flex w-full flex-col">
			<SessionLoadingSkeleton />
			<div className="relative h-96 w-full overflow-hidden rounded-t-3xl">
				<SuperImage src={user.banner} className="h-full w-full object-cover" />
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
				<div className="aspect-square h-[150%] relative">
					<SuperImage
						className="-translate-y-1/2 rounded-full object-cover w-full h-full"
						src={user.avatar}
					/>
				</div>
				<div className="relative flex w-full translate-y-[-25%] flex-col items-start gap-4 px-2 pl-4 text-white">
					<Status status={user.status} />
					<div className="flex w-full flex-col gap-2">
						<div className="text-3xl font-bold leading-5 select-all">
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
	const { session } = useContext(PublicContext) as any;
	const { data: user, isLoading: userLoading, error: userError } = useSWR(`/user/profile/${params.username}`, fetcher) as { data: User, isLoading: boolean, error: any };
	const falseUser = { ...user1, ...user};

	console.log({userLoading});

	if (userError)
		return <Error statusCode={401} />;

	return (
		<main className="relative mb-12 flex w-[1250px] max-w-full flex-col justify-center gap-4 select-none">
			<ProfileContext.Provider value={{ userLoading }}>
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
