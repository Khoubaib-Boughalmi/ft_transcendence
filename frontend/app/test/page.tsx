"use client";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import SuperImage from "@/components/SuperImage";
import PublicContext from "@/contexts/PublicContext";
import { getFlag, getRandomChallengeMessage, getRank } from "@/lib/utils";
import { user1, user2 } from "@/mocks/profile";
import { User } from "@/types/profile";
import { AnimatePresence, motion } from "framer-motion";
import { Divide, Gamepad2, Map, Swords, TimerIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function LoadingText({
	radius,
	letterSpacing,
	fontSize,
	text = "lllllllllllllllllllllll",
}: {
	text?: string;
	radius: number;
	letterSpacing: number;
	fontSize: number;
}) {
	return (
		<motion.div
			className="aspect-square"
			initial={{ rotate: 45 }}
			animate={{ rotate: -315 }}
			transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
		>
			<motion.div style={{ width: radius * 2 }}>
				<p aria-label={text} />
				<div aria-hidden="true" className="text">
					{text.split("").map((ch, i) => (
						<motion.span
							key={i}
							className={`absolute left-1/2 top-0`}
							style={{
								transformOrigin: `0 ${radius}px`,
								transform: `rotate(${i * letterSpacing}deg)`,
								fontSize,
							}}
						>
							{ch}
						</motion.span>
					))}
				</div>
			</motion.div>
		</motion.div>
	);
}

function LoadingScreen() {
	const { session } = useContext(PublicContext) as any;
	const challenge = useMemo(() => {
		return getRandomChallengeMessage();
	}, []);

	function PlayerSide({
		user,
		side,
		message,
	}: {
		user?: User;
		side: "left" | "right";
		message: string;
	}) {
		return (
			<div className={twMerge("flex flex-1 items-center  px-16")}>
				<div
					className={twMerge(
						"flex w-full gap-8 rounded-full bg-gradient-to-r from-card-200 p-4",
						side == "left" && "flex-row-reverse bg-gradient-to-l",
					)}
				>
					<div className="relative aspect-square h-32 rounded-full ring ring-card-600/25">
						<SuperImage
							className="absolute inset-0 h-full w-full rounded-full object-cover"
							src={user?.avatar}
							alt={user?.username}
							width={256}
							height={256}
						/>
					</div>
					<div
						className={twMerge(
							"flex flex-1 flex-col items-start justify-center text-foreground-900",
						)}
					>
						<div
							className={twMerge(
								"flex w-full justify-between",
								side == "left" && "flex-row-reverse",
							)}
						>
							<div
								className={twMerge(
									"flex flex-col",
									side == "left" && "text-right",
								)}
							>
								<div
									className={twMerge(
										"flex gap-2 text-2xl",
										side == "left" && "flex-row-reverse",
									)}
								>
									<div className="font-flag">
										{getFlag(user?.country)}
									</div>
									<div>{user?.username}</div>
								</div>
								<div className="leading-3 text-foreground-500">
									Level 1
								</div>
							</div>
							<div
								className={`aspect-square h-full flex-shrink-0 ${getRank(user.rank).color
									} flex items-center justify-center rounded-lg`}
							>
								<span
									className={`text-transparent ${getRank(user.rank).color
										} fuck-css text-2xl mix-blend-plus-lighter`}
								>
									{getRank(user.rank).name}
								</span>
							</div>
						</div>
						<Divider className="mt-4" />
						<div
							className={twMerge(
								"mt-4 line-clamp-1 w-full rounded-full bg-white px-4 py-1 text-black",
								side == "left" && "text-right",
							)}
						>
							{message}
						</div>
					</div>
				</div>
			</div>
		);
	}


	return (
		<div className="relative flex gap-4 flex-col h-full w-full">

			<div className="flex flex-1 flex-col">

			</div>
			<div className="flex shrink-0 gap-4">
				<div className="absolute inset-0 -z-10 flex items-center justify-center">
					<div className="aspect-square h-full animate-pulse rounded-full bg-card-600/50 blur-[200px]"></div>
				</div>
				<PlayerSide
					user={session}
					side="left"
					message={challenge.phrase}
				/>
				<div className="relative flex items-center justify-center text-[5rem] text-card-600">
					<div className="rounded-full bg-card-200 p-8 shadow-sm shadow-card-600">
						<Swords size={96} />
					</div>
					<div className="absolute inset-0 flex items-center justify-center text-card-700">
						<LoadingText
							radius={128}
							letterSpacing={20}
							fontSize={32}
						/>
					</div>
				</div>
				<PlayerSide
					user={user2}
					side="right"
					message={challenge.response}
				/>
			</div>
			<div className="flex flex-1 flex-col justify-center items-center text-white/50 text-xl animate-pulse">
				Waiting for opponent...

			</div>
		</div>

	)
}

function GameScreen() {
	function PlayerSide({ side, user }: { side: "left" | "right", user: User }) {
		return (
			<div className="h-full py-4">
				<div className="h-full aspect-square rounded-full overflow-hidden">
					<SuperImage
						className="h-full w-full object-cover"
						src={user.avatar}
						alt={user.username}
						width={256}
						height={256}
					/>
				</div>
			</div>
		)
	}

	return (
		<div className="h-full w-full">
			<div className="h-32 w-full bg-gradient-to-b from-black/50 pt-8 flex justify-center items-center gap-8 relative">
				<div className="absolute inset-0 bg-gradient-to-t from-black/50 -translate-y-full"></div>
				<PlayerSide side="left" user={user1} />
				<div className="h-full flex aspect-video rounded-xl overflow-hidden">
					<div className="flex-1 flex justify-center items-center bg-card-200 text-3xl text-white">
						1
					</div>
					<div className="flex-1 flex justify-center items-center bg-card-500 text-3xl text-white">
						2
					</div>
				</div>
				<PlayerSide side="right" user={user2} />
			</div>
			<div className="w-full flex justify-center items-center text-center text-white text-xs py-4">
				<div className="bg-card-400 rounded-full p-2 px-12">
					First to 5
				</div>
			</div>
		</div>
	)
}

export default function Page() {
	const [tab, setTab] = useState("loading");
	const tabs = [[
		"loading",
		<LoadingScreen />
	], [
		"game",
		<GameScreen />
	]] as any;

	console.log("rendering", tab);

	return (
		<div  className="absolute inset-0 flex justify-center items-center overflow-hidden">
		<motion.div
			initial={{ opacity: 0, translateY: "100%"}}
			animate={{ opacity: 1, translateY: "0%"}}
		onClick={() => {
			setTab((prev) => prev == "loading" ? "game" : "loading");
		}} className="flex items-center justify-center flex-col gap-4 py-0">
			<Card className="bg-card-200 w-full h-12" classNames={{
				innerContainer: "flex items-center justify-between px-4 py-0"
			}}>
				<div className="flex gap-2">
					<Gamepad2 size={24} />
					Casual
				</div>
				<div className="text-foreground-700 font-bold text-lg flex gap-2 relative h-full items-center">
					<TimerIcon size={24} />
					2:00
					<div className="absolute inset-x-[-300px] inset-y-0 -z-10 bg-gradient-to-r from-transparent to-transparent via-card-500">

					</div>
				</div>
				<div className="flex gap-2">
					Space
					<Map size={24} />
				</div>
			</Card>
			<Card
				className="aspect-video h-[75vh] overflow-hidden"
				classNames={{
					innerContainer: "p-0",
				}}
			>
				<AnimatePresence  mode="popLayout">
					<div className="h-full w-full overflow-hidden rounded-3xl select-none">

					{
						tab == "loading" ? (
							<motion.div
								key="loading"
								initial={{ opacity: 0, translateY: "100%"}}
								animate={{ opacity: 1, translateY: "0%"}}
								exit={{ opacity: 0, translateY: "-100%" }}
								className="h-full w-full"
							>
								<LoadingScreen />
							</motion.div>
						) : (
							<motion.div
								key="game"
								initial={{ opacity: 0, translateY: "100%"}}
								animate={{ opacity: 1, translateY: "0%"}}
								exit={{ opacity: 0, translateY: "-100%"}}
								className="h-full w-full"
							>
								<GameScreen />
							</motion.div>
						)
					}
										</div>

				</AnimatePresence>
			</Card>
		</motion.div>
		</div>
	);
}
