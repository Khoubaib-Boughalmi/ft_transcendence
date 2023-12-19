import { User } from "@/types/profile";
import { getFlag, getRank } from "@/lib/utils";
import Status from "./Status";
import Divider from "./Divider";
import SuperImage from "./SuperImage";

export default function UserHover({ user }: { user: User }) {
	return (
		<div className="flex w-48 flex-col gap-2">
			<div className="w-full flex-col">

			<div className="aspect-video w-full overflow-hidden rounded-t-xl relative">
				<SuperImage src={user.banner} className="h-full w-full object-cover" />
			</div>
			<div className="flex h-8 w-full gap-2 rounded-b-xl bg-card-300 relative">
				<SuperImage
					src={user.avatar}
					className="aspect-square h-[200%] flex-shrink-0 -translate-y-1/2 rounded-full object-cover"
					/>
				<div className="relative flex flex-1 flex-col justify-center text-sm leading-3 text-white">
					<div className="absolute inset-0 flex -translate-y-full items-end pb-2"></div>
					<span className="text-xs leading-3" >{user.username}</span>
					<span className="flex gap-1 text-[0.5rem]">
						<span>{getFlag(user.country)}</span>
						<span>{user.country}</span>
					</span>
				</div>
			</div>
					</div>
			<Status status={user.status} size="sm" />
			<div className="flex w-full gap-2">
				<div
					className={`aspect-square h-16 shrink-0 overflow-hidden rounded-xl bg-red-500 ${getRank(user.rank).color} flex items-center justify-center`}
				>
					<div
						className={`${getRank(user.rank).color} fuck-css text-3xl text-transparent mix-blend-plus-lighter`}
					>
						{getRank(user.rank).name}
					</div>
				</div>
				<div className="flex flex-col w-full gap-2">
					<div className="w-full flex flex-col bg-card rounded-xl px-2  text-[0.55rem] leading-3	py-1">
						<div className="w-full flex justify-between px-2">
							<div>
								Level
							</div>
							<div>
								{user.level}
							</div>
						</div>
					</div>
					<div className="w-full flex flex-col bg-card-300 rounded-xl px-2  text-[0.55rem] leading-3	py-1 flex-1 gap-1">
						<div className="w-full flex justify-between px-2">
							<div>
								Score
							</div>
							<div>
								{
									user.achievements.reduce(
										(acc, curr) => acc + curr.score,
										0,
									)
								}
							</div>
						</div>
						<div className="w-full flex justify-between px-2">
							<div>
								Completion
							</div>
							<div>
								{user.achievements_percentage}%
							</div>
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
