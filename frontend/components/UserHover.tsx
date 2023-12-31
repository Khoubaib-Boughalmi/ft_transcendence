import { InteractionType, User } from "@/types/profile";
import { InteractionFunctionality, getFlag, getRank } from "@/lib/utils";
import Status from "./Status";
import Divider from "./Divider";
import SuperImage from "./SuperImage";
import { Button } from "./Button";
import {
	HeartHandshake,
	MessageSquareIcon,
	Swords,
	UserMinus2,
	UserPlus2,
	UserX2,
} from "lucide-react";
import { useContext, useState } from "react";
import PublicContext from "@/contexts/PublicContext";
import { twMerge } from "tailwind-merge";

export default function UserHover({ user }: { user: User }) {
	const [loading, setLoading] = useState(false);
	const { session, sessionMutate } = useContext(PublicContext) as any;
	const areFriends = session.friends.find((f: User) => f.id == user.id);
	const isBlocked = session.blocked_users.find((f: User) => f.id == user.id);

	return (
		<div className="flex w-48 flex-col gap-1">
			<div className="w-full flex-col">
				<div
					className="relative aspect-video w-full overflow-hidden rounded-t-xl
				after:absolute after:inset-0 after:bg-gradient-to-t after:from-card-250 after:to-transparent after:content-['']
			
			"
				>
					<SuperImage
						src={user.banner}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="relative flex h-8 w-full gap-2 rounded-b-xl bg-card-250">
					<SuperImage
						src={user.avatar}
						className="aspect-square h-[200%] flex-shrink-0 -translate-y-1/2 rounded-full object-cover"
					/>
					<div className="relative flex flex-1 flex-col justify-center text-sm leading-3 text-white">
						<div className="absolute inset-0 flex -translate-y-full items-end pb-2"></div>
						<span className="w-28 truncate pr-2 text-xs leading-3">
							{user.username}
						</span>
						<span className="flex gap-1 text-[0.5rem]">
							<span>{getFlag(user.country)}</span>
							<span>{user.country}</span>
						</span>
					</div>
				</div>
			</div>
			<div className="rounded-full bg-card-250 p-2">
				<Status user={user} size="sm" />
			</div>
			{session.id != user.id && (
				<div className="flex w-full gap-2 rounded-full bg-card-250 p-2">
					{!isBlocked && (
						<>
							<Button
								disabled={loading}
								className="aspect-square flex-1"
								iconOnly
								variant="ghost"
								onClick={() => {
									InteractionFunctionality(areFriends ? "unfriend" : "add", user, sessionMutate, setLoading);
								}}
							>
								{areFriends ? <UserMinus2 /> : <UserPlus2 />}
							</Button>
							<Button
								disabled={loading}
								className="aspect-square flex-1"
								iconOnly
								variant="ghost"
								onClick={() => {
									// InteractionFunctionality("block", user, sessionMutate, setLoading);
								}}
							>
								<Swords />
							</Button>
							<Button
								disabled={loading}
								className="aspect-square flex-1"
								iconOnly
								variant="ghost"
							>
								<MessageSquareIcon />
							</Button>
						</>
					)}
					<Button
						disabled={loading}
						className={twMerge("aspect-square flex-1", isBlocked && "aspect-auto text-xs h-8")}
						iconOnly
						variant="danger"
						onClick={() => {
							InteractionFunctionality(isBlocked ? "unblock" : "block", user, sessionMutate, setLoading);
						}}
					>
						{isBlocked ? <><HeartHandshake size={16}/> Unblock</> : <UserX2 />}
					</Button>
				</div>
			)}
			<div className="flex w-full gap-2 rounded-xl bg-card-250 p-2">
				<div
					className={`aspect-square h-16 shrink-0 overflow-hidden rounded-xl bg-red-500 ${
						getRank(user.rank).color
					} flex items-center justify-center`}
				>
					<div
						className={`${
							getRank(user.rank).color
						} fuck-css text-3xl text-transparent mix-blend-plus-lighter`}
					>
						{getRank(user.rank).name}
					</div>
				</div>
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-col rounded-xl bg-card px-2  py-1 text-[0.55rem]	leading-3">
						<div className="flex w-full justify-between px-2">
							<div>Level</div>
							<div>{user.level}</div>
						</div>
					</div>
					<div className="flex w-full flex-1 flex-col gap-1 rounded-xl  bg-card-300 px-2	py-1 text-[0.55rem] leading-3">
						<div className="flex w-full justify-between px-2">
							<div>Score</div>
							<div>
								{user.achievements.reduce(
									(acc, curr) => acc + curr.score,
									0,
								)}
							</div>
						</div>
						<div className="flex w-full justify-between px-2">
							<div>Completion</div>
							<div>{user.achievements_percentage}%</div>
						</div>
					</div>
				</div>
				{/* <div className="flex flex-1 flex-col gap-2">
					<div className="relative h-3 w-full overflow-hidden rounded-xl bg-black">
						<div className="h-full w-1/2 bg-gradient-to-r from-primary to-secondary"></div>
					</div>
					<div className="relative h-3 w-full overflow-hidden rounded-xl bg-black">
						<div className="h-full w-1/2 bg-secondary"></div>
					</div>
				</div> */}
			</div>
			{/* <div className="my-2 h-1 w-full overflow-hidden rounded-full bg-black">
				<div className="h-full w-1/2 bg-gradient-to-r from-primary to-secondary"></div>
			</div>
			<div className="flex items-start gap-2">
				<span className="text-[0.55rem] leading-[0.55rem]">Level</span>
				<span className="text-base leading-4">{user.level}</span>
			</div> */}
		</div>
	);
}
