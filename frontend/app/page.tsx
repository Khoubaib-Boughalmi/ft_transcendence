"use client";
import Card from "@/components/Card";
import PublicContext from "@/contexts/PublicContext";
import { Metadata } from "next";
import { useContext, useEffect, useState } from "react";
import { history, user1 } from "@/mocks/profile";
import MatchHistoryList, {
	MatchHistoryEntry,
} from "@/components/MatchHistoryList";
import UserList from "@/components/UserList";
import SuperImage from "@/components/SuperImage";
import Divider from "@/components/Divider";
import { getFlag, getRank } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import { Circle, Crown, Medal, Swords } from "lucide-react";
import { User } from "@/types/profile";
import SuperTooltip from "@/components/SuperTooltip";
import UserHover from "@/components/UserHover";
import Link from "next/link";
import { Button } from "@/components/Button";
import { ScrollShadow } from "@nextui-org/react";
import NoData from "@/components/NoData";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import socket from "@/lib/socket";

function TopThreeRank({ user, rank }: { user: User; rank: number }) {
	return (
		<div
			className={twMerge(
				"relative h-4/6 w-24 rounded-b-xl rounded-t-[40px] bg-card-600/50",
				rank == 3 && "h-2/6 bg-card-500",
				rank == 2 && "h-[45%] bg-card-500",
			)}
		>
			<SuperTooltip
				delay={250}
				content={<UserHover user={user} />}
				isDismissable={true}
			>
				<div className="relative aspect-square w-full -translate-y-1/2 scale-75 cursor-pointer rounded-full bg-black shadow-xl shadow-card-400 transition-all hover:scale-80 hover:brightness-110">
					<Link href={`/profile/${user.username}`}>
						<SuperImage
							src={user.avatar}
							alt="avatar"
							className="absolute inset-0 h-full w-full rounded-full object-cover"
							width={200}
							height={200}
						/>
					</Link>
				</div>
			</SuperTooltip>
			{rank == 1 && (
				<>
					<div className="absolute -top-10 -z-10 flex w-full -translate-y-full items-center justify-center text-yellow-400">
						<Crown size={48} />
					</div>
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-primary-600 to-primary-500 bg-clip-text text-[4rem] text-transparent">
						1
					</div>
				</>
			)}
			<div className="absolute bottom-0 flex w-full items-center justify-center gap-1 py-4 text-white">
				<Medal size={16} />
				500
			</div>
		</div>
	);
}

async function JoinQueueing(session: any, router: any) {
	console.log("Joining queueing");
	try {
		// Make the HTTP request to invite the user
		const response = await axios.post("/game/JoinQueueing", {
			user1: session.id,
			socket: socket.id,
		});
		// Redirect the router to the game session
		router.push(`/test/${response.data.id}`);
	} catch (error) {
		console.error("Error inviting player:", error);
	}
}

function DivisionClass({ exp }: { exp: number }) {
	const rommanNumerals = ["I", "II", "III", "IV", "V", "VI"];
	const division = Math.floor((exp % 500) / 100);

	console.log("Division", division);

	return (
		<>
			<span className="line-clamp-1">
				Division {rommanNumerals[division]}
			</span>
			<span className="line-clamp-1">
				Division {rommanNumerals[division + 1]}
			</span>
		</>
	);
}

export default function Page() {
	const { session } = useContext(PublicContext) as any;
	const [queuing, setQueuing] = useState(false);
	const router = useRouter();

	useEffect(() => {
		document.title = "long enough";
	}, []);

	return (
		<div className="relative flex-1">
			<div className="flex h-full w-full flex-col gap-4 px-12 pb-12 2xl:px-64	 2xl:pb-16">
				<div className="ml-auto shrink-0 text-xl">
					Good {new Date().getHours() < 14 ? "morning" : "evening"},{" "}
					<span className="mx-2 text-2xl font-medium text-accent-700">
						{session?.username}
					</span>
				</div>
				<div className="relative flex-1">
					<div className="absolute inset-0 grid flex-1 grid-cols-10 grid-rows-10 gap-4">
						<div className="col-span-2 row-span-10 flex flex-col gap-4 ">
							<Card
								className="shrink-0 p-0"
								classNames={{
									innerContainer: "flex flex-col gap-8 p-0",
								}}
							>
								<div className="mb-12 flex h-24 w-full justify-center">
									<div className="relative aspect-square h-[200%] translate-y-[-25%] rounded-full bg-black outline outline-4 outline-card-400">
										<SuperImage
											src={session?.avatar}
											alt="avatar"
											className="absolute inset-0 h-full w-full rounded-full object-cover"
											width={200}
											height={200}
										/>
									</div>
								</div>
								<div className="mb-8 flex w-full flex-col gap-2 px-8">
									<div className="flex items-end justify-between text-sm">
										<div>
											<span className="text-white">
												{session?.level_exp % 100}
											</span>
											<span>/100 XP</span>
										</div>
										<div className="flex aspect-square h-8 items-center justify-center rounded-full bg-black bg-gradient-to-b from-accent to-card font-medium  text-white">
											{Math.floor(
												session?.level_exp / 100,
											)}
										</div>
									</div>
									<div className="h-2 w-full overflow-hidden rounded-xl bg-card-100">
										<div
											style={{
												width: `${session?.level_exp % 100}%`,
											}}
											className="h-full w-0 bg-primary "
										></div>
									</div>
								</div>
							</Card>
							<Card
								className="flex-1 overflow-hidden bg-card-300 p-2"
								classNames={{
									innerContainer:
										"overflow-y-scroll no-scrollbar",
								}}
							>
								<UserList
									type="list"
									users={session.friends}
									classNames={{
										entryContainer: "rounded-3xl",
									}}
								/>
							</Card>
						</div>
						<div className="col-span-5 row-span-10 flex flex-col gap-4">
							<Card
								className="h-72 w-full shrink-0 overflow-hidden bg-gradient-to-r from-card-500 via-card-400 to-card-400"
								classNames={{
									innerContainer: "p-0",
								}}
							>
								<div className="relative grid h-full w-full grid-cols-10 overflow-hidden rounded-xl">
									<div className="relative z-10 col-span-6">
										<div className="absolute right-0 h-full w-32 translate-x-full bg-gradient-to-r from-card-400 " />
										<div className="flex h-full w-full flex-col items-start justify-between gap-2 p-8">
											<div>
												<div className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-3 py-1 text-sm text-white">
													<div className="aspect-square h-2.5 rounded-full bg-white" />
													Online
												</div>
											</div>
											<div className="line-clamp-1 text-3xl text-white">
												Ranked Match
											</div>
											<p className="-mt-4 line-clamp-2">
												Compete against players of
												similar skill level and climb
												the ladder to the top!
											</p>
											<div className="flex w-full flex-col gap-1 self-center">
												<div className="h-4 w-full overflow-hidden rounded-xl bg-card-200">
													<div
														style={{
															width: `${session?.division_exp % 100}%`,
														}}
														className="h-full w-0 bg-primary"
													></div>
												</div>
												<div className="flex w-full justify-between text-sm text-white">
													<DivisionClass
														exp={
															session?.division_exp
														}
													/>
												</div>
											</div>
											<Button
												startContent={
													<Swords size={18} />
												}
												onClick={() => {
													setQueuing(true);
													setTimeout(() => {
														JoinQueueing(
															session,
															router,
														);
													}, 1000);
												}}
												loading={queuing}
											>
												Start Queueing
											</Button>
										</div>
									</div>
									<div className="relative col-span-4 flex justify-end  p-8">
										<div className="absolute inset-0 overflow-hidden">
											<SuperImage
												priority
												src={"/background3.png"}
												width={1280}
												height={720}
												alt="bg"
												className="absolute inset-0 h-full w-full scale-150 object-cover opacity-50 blur-lg"
											/>
										</div>
										<div className="z-10 aspect-square h-full">
											<div
												className={`z-10 flex aspect-square h-full w-full flex-shrink-0 flex-col items-center justify-between overflow-hidden rounded-3xl lg:w-auto ${getRank(session.rank).color
													} relative `}
											>
												<div className="flex flex-1 flex-col items-center justify-center gap-2">
													<span
														className={`text-[8rem] font-bold leading-[6.5rem] text-transparent mix-blend-plus-lighter ${getRank(
															session.rank,
														).color
															} fuck-css`}
													>
														{
															getRank(
																session.rank,
															).name
														}
													</span>
													<Divider />
													<span className="text-white">
														Division{" "}
														{session.division}
													</span>
													<div></div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Card>
							<Card
								classNames={{
									innerContainer:
										"flex flex-col h-full overflow-y-scroll no-scrollbar flex-1 gap-0 p-0 ",
								}}
								className="no-scrollbar h-full overflow-y-scroll bg-gradient-to-r from-card-200 to-card-300 p-0"
							>
								<div className="relative flex min-h-72 flex-1 shrink-0  items-end justify-center pt-12">
									<div className="absolute inset-0 z-10 aspect-square translate-y-[-70%] rounded-full bg-card-500 blur-[69px]" />
									<div className="z-20 flex h-full items-end justify-center">
										<TopThreeRank user={session} rank={2} />
										<TopThreeRank user={session} rank={1} />
										<TopThreeRank user={session} rank={3} />
									</div>
								</div>
								{/* <Divider /> */}
								<div className="flex flex-1 items-end gap-2 p-8 ">
									{[
										[
											session,
											session,
											session,
											session,
											session,
										],
										[
											session,
											session,
											session,
											session,
											session,
										],
									].map((users, i) => {
										return (
											<UserList
												key={i}
												classNames={{
													entryContainer:
														"rounded-3xl pr-4",
													list: "z-10 flex-1",
												}}
												type="list"
												startContent={(user) => {
													return (
														<div className="-mr-2  flex aspect-square h-full shrink-0 items-center justify-center text-xl font-medium">
															1
														</div>
													);
												}}
												endContent={(user) => {
													return (
														<div className="flex items-center justify-center">
															<div className="jsutify-center flex items-center gap-1 rounded-xl bg-secondary-300 px-2">
																<div className="text-secondary-700">
																	<Medal
																		size={
																			16
																		}
																	/>
																</div>
																<div className="flex items-center justify-center gap-4 bg-gradient-to-t from-secondary-500 to-white bg-clip-text text-lg font-bold text-transparent">
																	5842
																</div>
															</div>
														</div>
													);
												}}
												users={users}
											/>
										);
									})}
								</div>
							</Card>
						</div>
						<div className="relative col-span-3 row-span-10">
							<Card className="no-scrollbar absolute inset-0 flex overflow-y-scroll p-2">
								<div className="flex-1">
									<div className="flex flex-col gap-2">
										{session.history.length == 0 && (
											<NoData />
										)}
										{session.history.map((match, i) => (
											<MatchHistoryEntry
												match={match}
												key={i}
											/>
										))}
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
