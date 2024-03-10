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
						<div className="flex h-24 w-full justify-center mb-12">
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
								<div className="flex aspect-square h-8 items-center justify-center rounded-full bg-black bg-gradient-to-b from-accent to-card font-medium text-white">
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
								["Flag", getFlag(session?.country), "font-flag"],
								["Wins", session?.wins],
								["Losses", session?.losses],
								["Ratio", ((session?.wins / session?.losses) || 0).toFixed(2) + "%"],


								[
									"Joined",
									new Date(session?.createdAt).toDateString(),
								],

							].map(([key, value, className]) => (
								<>
									<span>{key}</span>
									<span className={twMerge(" text-white", className)}>
										{value}
									</span>
								</>
							))}
						</div>
					</Card>
					<Card
						className=" col-span-7 row-span-3 bg-gradient-to-r from-card-300 to-card-400 via-card-400"
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
									className="absolute inset-0 h-full w-full scale-150 object-cover"
								/>
							</div>
						</div>
					</Card>
					<Card className="row-span-7 col-span-7 bg-gradient-to-r from-card-300 to-card-400">

					</Card>
				</div>
				<div className="col-span-3 flex flex-col gap-4">
					<Card className="shrink-0 bg-card-400">
						<MatchHistoryList history={history.slice(0, 3)} />
					</Card>
					<Card className="flex-1 bg-card-400">
						<UserList type="list" users={session.friends} classNames={{
							entryContainer: "rounded-3xl"
						}} />
					</Card>
				</div>
			</div>
		</div>
	);
}
