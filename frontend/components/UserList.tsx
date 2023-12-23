import { User } from "@/types/profile";
import { Tooltip } from "@nextui-org/react";
import { useRef } from "react";
import UserHover from "./UserHover";
import SuperImage from "./SuperImage";
import { getRank } from "@/lib/utils";
import Status from "./Status";
import NoData from "./NoData";
import { twMerge } from "tailwind-merge";

type ClassNames = {container?: string, list?: string, entry?: string}

function UserListEntry({ user, classNames }: { user: User, classNames?: ClassNames }) {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<Tooltip
			classNames={{
				content: "p-2 rounded-xl",
			}}
			content={<UserHover user={user} />}
			placement={(ref.current?.offsetHeight || 0) > 150 ? "top" : "right"}
		>
			<div
				data-status={user.status}
				ref={ref}
				className={twMerge(`data-[status=Offline]:after:content:[''] relative flex h-16 w-full items-center gap-4 overflow-hidden rounded-xl bg-card-400 p-2 text-white transition-all duration-300 hover:scale-105
							hover:bg-card-500 hover:shadow-lg data-[status=Offline]:after:absolute data-[status=Offline]:after:inset-0 data-[status=Offline]:after:bg-black/50 @4xl:aspect-square @4xl:h-auto @4xl:flex-col @4xl:justify-center @4xl:gap-1
							`, classNames?.entry)}
			>
				<div className="aspect-square h-full overflow-hidden rounded-full @4xl:h-3/5 relative flex-shrink-0">
					<SuperImage
						src={user.avatar}
						className="h-full w-full object-cover"
					/>
				</div>
				<div
					className={`absolute right-4 flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-sm shadow-black @4xl:left-[20%] @4xl:right-auto @4xl:top-[10%] @4xl:h-6 @4xl:w-6 @4xl:text-base  ${
						getRank(user.rank).color
					}`}
				>
					<span
						className={`text-transparent mix-blend-plus-lighter ${
							getRank(user.rank).color
						} fuck-css`}
					>
						{getRank(user.rank).name}
					</span>
				</div>
				<div className="flex flex-col items-start text-sm text-white @4xl:items-center select-all w-full">
					<div className="truncate w-full relative h-6">
						<div className="absolute inset-0	">
							<div className="truncate @4xl:text-center @4xl:px-4 pr-16">

							{user.username}
							</div>
						</div>
					</div>
					<Status status={user.status} size="sm" />
				</div>
			</div>
		</Tooltip>
	);
}

export default function UserList({ users, classNames }: { users: User[], classNames?: ClassNames}) {
	return (
		<div className={twMerge("w-full p-2 @container", classNames?.container)}>
			{users.length == 0 && <NoData />}
			<div className={twMerge("flex flex-col flex-wrap gap-2 @4xl:grid @4xl:grid-cols-7", classNames?.list)}>
				{users.map((user, i) => (
					<UserListEntry classNames={classNames} key={i} user={user} />
				))}
			</div>
		</div>
	);
}