"use client";
import Card from "@/components/Card";
import PublicContext from "@/contexts/PublicContext";
import { Metadata } from "next";
import { useContext, useEffect } from "react";
import { history } from "@/mocks/profile";
import MatchHistoryList from "@/components/MatchHistoryList";
import UserList from "@/components/UserList";
import SuperImage from "@/components/SuperImage";
import Divider from "@/components/Divider";
import { getFlag } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import { Crown, Medal } from "lucide-react";
import { User } from "@/types/profile";
import SuperTooltip from "@/components/SuperTooltip";
import UserHover from "@/components/UserHover";
import Link from "next/link";

function TopThreeRank({ user, rank }: { user: User; rank: number }) {
	return (
		<div
			className={twMerge(
				"relative h-4/6 w-24 rounded-b-xl rounded-t-[40px] bg-card-600/50",
				rank != 1 && "h-2/6 bg-card-500",
			)}
		>
			<SuperTooltip
				delay={250}
				content={<UserHover user={user} />}
				isDismissable={true}
			>
				<div className="relative aspect-square w-full -translate-y-1/2 scale-75 rounded-full bg-black shadow-xl shadow-card-400 transition-all hover:scale-80 hover:brightness-110 cursor-pointer">
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

export default function Page() {
	const { session } = useContext(PublicContext) as any;

	useEffect(() => {
		document.title = "long enough";
	}, []);

	return (
		<div className="flex h-full w-full flex-col gap-4 px-64 pb-16">
			<div className="ml-auto shrink-0 text-xl">
				Good {new Date().getHours() < 14 ? "morning" : "evening"},{" "}
				<span className="mx-2 text-2xl font-medium text-accent-700">
					{session?.username}
				</span>
			</div>
			<div className="grid flex-1 grid-cols-10 gap-4">
				<div className="col-span-7 grid grid-cols-10 grid-rows-10 gap-4">
					<Card
						className="col-span-3 row-span-10"
						classNames={{
							innerContainer: "flex flex-col gap-8",
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
						<div className="flex w-full flex-col gap-2 px-4">
							<div className="flex items-end justify-between text-sm">
								<div>
									<span className="text-white">10</span>
									<span>/100 XP</span>
								</div>
								<div className="flex aspect-square h-8 items-center justify-center rounded-full bg-black bg-gradient-to-b from-accent to-card font-medium  text-white">
									1
								</div>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-xl bg-card-100">
								<div className="h-full w-1/2 bg-primary"></div>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-y-2 px-4">
							{[
								["Username", session?.username],
								["Country", session?.country],
								[
									"Flag",
									getFlag(session?.country),
									"font-flag",
								],
								["Wins", session?.wins],
								["Losses", session?.losses],
								[
									"Ratio",
									(
										session?.wins / session?.losses || 0
									).toFixed(2) + "%",
								],

								[
									"Joined",
									new Date(session?.createdAt).toDateString(),
								],
							].map(([key, value, className]) => (
								<>
									<span>{key}</span>
									<span
										className={twMerge(
											" text-white",
											className,
										)}
									>
										{value}
									</span>
								</>
							))}
						</div>
					</Card>
					<Card
						className=" col-span-7 row-span-3 bg-gradient-to-r from-card-300 via-card-400 to-card-400"
						classNames={{
							innerContainer: "p-0",
						}}
					>
						<div className="relative grid h-full w-full grid-cols-10 overflow-hidden rounded-xl">
							<div className="relative z-10 col-span-6">
								<div className="absolute right-0 h-full w-32 translate-x-full bg-gradient-to-r from-card-400 " />
								<div className="flex h-full w-full items-center justify-center"></div>
							</div>
							<div className="relative col-span-4 overflow-hidden">
								<SuperImage
									src={"/background3.png"}
									width={1280}
									height={720}
									alt="bg"
									className="absolute inset-0 h-full w-full scale-150 object-cover opacity-50 backdrop-blur-xl"
								/>
							</div>
						</div>
					</Card>
					<Card
						classNames={{
							innerContainer: "flex flex-col gap-0 p-0 ",
						}}
						className="col-span-7 row-span-7 overflow-hidden bg-gradient-to-r from-card-200 to-card-300 p-0"
					>
						<div className="relative flex flex-1 shrink-0  items-end justify-center pt-8">
							<div className="absolute inset-0 -z-10 aspect-square translate-y-[-70%] rounded-full bg-card-500 blur-[69px]"></div>

							<TopThreeRank user={session} rank={2} />
							<TopThreeRank user={session} rank={1} />
							<TopThreeRank user={session} rank={3} />
						</div>
						{/* <Divider /> */}
						<div className="flex flex-1 gap-2 p-8 ">
							{[
								[session, session, session, session, session],
								[session, session, session, session, session],
							].map((users) => {
								return (
									<UserList
										classNames={{
											entryContainer: "rounded-3xl pr-4",
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
														<div className="text-secondary-600">
															<Medal size={16} />
														</div>
														<div className="flex items-center justify-center gap-4 bg-gradient-to-t from-secondary-400 to-secondary-700 bg-clip-text text-lg font-bold text-transparent">
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
				<div className="col-span-3 flex flex-col gap-4">
					<Card className="shrink-0 bg-card-400">
						<MatchHistoryList history={history.slice(0, 3)} />
					</Card>
					<Card className="flex-1 bg-card-400">
						<UserList
							type="list"
							users={session.friends}
							classNames={{
								entryContainer: "rounded-3xl",
							}}
						/>
					</Card>
				</div>
			</div>
		</div>
	);
}
