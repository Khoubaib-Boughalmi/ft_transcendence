"use client";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import SuperImage from "@/components/SuperImage";
import PublicContext from "@/contexts/PublicContext";
import { getFlag, getRandomChallengeMessage, getRank } from "@/lib/utils";
import { user2 } from "@/mocks/profile";
import { User } from "@/types/profile";
import { motion } from "framer-motion";
import { Divide, Swords } from "lucide-react";
import { useContext, useMemo } from "react";
import { twMerge } from "tailwind-merge";

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
						<div className={twMerge("flex flex-col", side == "left" && "text-right")}>
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
							className={`aspect-square h-full flex-shrink-0 ${
								getRank(user.rank).color
							} flex items-center justify-center rounded-lg`}
						>
							<span
								className={`text-transparent ${
									getRank(user.rank).color
								} fuck-css text-2xl mix-blend-plus-lighter`}
							>
								{getRank(user.rank).name}
							</span>
						</div>
					</div>
					<Divider className="mt-4" />
					<div
						className={twMerge(
							"mt-4 w-full rounded-full bg-white px-4 py-1 text-black",
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

export default function Page() {
	const { session } = useContext(PublicContext) as any;
	const challenge = useMemo(() => {
		return getRandomChallengeMessage();
	}, []);

	return (
		<div className="flex items-center justify-center pb-16">
			<Card
				className="aspect-video h-[75vh]"
				classNames={{
					innerContainer: "relative flex gap-4    ",
				}}
			>
				<div className="absolute inset-0 -z-10 flex items-center justify-center">
					<div className="aspect-square h-full animate-pulse rounded-full bg-card-500 blur-[128px]"></div>
					<div className="absolute inset-0 flex items-center justify-center text-card-700">
						<LoadingText
							radius={128}
							letterSpacing={20}
							fontSize={32}
						/>
					</div>
				</div>
				<PlayerSide
					user={session}
					side="left"
					message={challenge.phrase}
				/>
				<div className="flex items-center justify-center text-[5rem] font-black text-card-600">
					<div className="rounded-full bg-card-200 p-8 shadow-sm shadow-card-600">
						<Swords size={96} />
					</div>
				</div>
				<PlayerSide
					user={user2}
					side="right"
					message={challenge.response}
				/>
			</Card>
		</div>
	);
}
