import { useIsOnline } from "@/lib/utils";
import { User } from "@/types/profile";
import { Tooltip } from "@nextui-org/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import NoData from "./NoData";
import Status from "./Status";
import SuperImage from "./SuperImage";
import UserHover from "./UserHover";

type ClassNames = {
	list?: string;
	entry?: string;
	entryContainer?: string;
};

function SuperTooltip({
	children,
	...props
}: React.ComponentProps<typeof Tooltip>) {
	// const [portal, setPortal] = useState(null) as any;
	// const updatePortal = () => {
	// 	setPortal(document.querySelector(`*[data-slot="list"]`) || document.querySelector('*[role="dialog"]') || document.body);
	// }

	// useEffect(() => {
	// 	updatePortal()
	// }, []);

	return (
		<Tooltip
			className={twMerge("bg-card-200 p-2", props.className)}
			radius="lg"
			// onMouseEnter={updatePortal}
			classNames={{
				arrow: twMerge("", props.classNames?.arrow),
				base: twMerge("", props.classNames?.base),
				content: twMerge("", props.classNames?.content),
			}}
			// portalContainer={portal}
			{...props}
		>
			{children}
		</Tooltip>
	);
}

function UserListGridEntry({
	user,
	hoverDelay,
}: {
	user: User;
	hoverDelay?: number;
}) {
	const isOnline = useIsOnline(user.id);

	return (
		<SuperTooltip
			delay={hoverDelay || 250}
			content={<UserHover user={user} />}
		>
			<Link
				href={`/profile/${user.username}`}
				className={twMerge(
					`flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl bg-card-400 p-4 text-white transition-all
					hover:scale-105 hover:brightness-110`,
					isOnline == false && "brightness-[60%]",
				)}
			>
				<div className="relative aspect-square h-24 w-24 overflow-hidden rounded-full">
					<SuperImage
						alt={user.username}
						width={64}
						height={64}
						src={user.avatar}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="w-full truncate text-center text-sm">
					{user.username}
				</div>
				<Status isOnline={isOnline} userId={user.id} />
			</Link>
		</SuperTooltip>
	);
}

function UserListListEntry({
	user,
	size,
	classNames,
	hoverDelay,
	Controls,
	showBadge,
}: {
	user: User;
	hoverDelay?: number;
	size?: "xs" | "sm" | "md";
	classNames?: ClassNames;
	Controls?: any;
	showBadge?: (user: User) => boolean;
}) {
	const isOnline = useIsOnline(user.id);

	return (
		<SuperTooltip
			placement="left"
			delay={hoverDelay || 250}
			content={<UserHover user={user} />}
		>
			<div
				className={twMerge(
					`flex w-full gap-4 rounded-xl bg-card-400 p-4 text-white transition-all`,
					size == "xs" && "gap-2 p-2",
					!Controls && isOnline == false && "brightness-[60%]",
					classNames?.entryContainer,
				)}
			>
				<Link
					href={`/profile/${user.username}`}
					className={twMerge(
						`relative flex-1 gap-4 text-white
						transition-all hover:scale-105 hover:brightness-110`,
						!Controls && isOnline == false && "brightness-[60%]",
						size == "xs" && "gap-2",
						classNames?.entry,
					)}
				>
					{showBadge && showBadge(user) && (
						<div className="absolute left-0 top-0 z-10">
							<img
								src="/owner.png"
								className="h-3 w-3 object-cover"
							/>
						</div>
					)}
					<div className="flex h-full w-full items-center gap-4 overflow-hidden">
						<div
							className={twMerge(
								"relative aspect-square h-12 w-12 flex-shrink-0 overflow-hidden rounded-full",
								size == "xs" && "h-8 w-8",
							)}
						>
							<SuperImage
								alt={user.username}
								width={64}
								height={64}
								src={user.avatar}
								className="h-full w-full object-cover"
							/>
						</div>
						<div className="flex flex-1 flex-col items-start overflow-hidden">
							<div
								className={twMerge(
									"w-full truncate text-sm",
									size == "xs" && "text-xs",
								)}
							>
								{user.username}
							</div>
							{!Controls && (
								<Status
									isOnline={isOnline}
									size={size}
									userId={user.id}
								/>
							)}
						</div>
					</div>
				</Link>
				{Controls && <Controls user={user} />}
			</div>
		</SuperTooltip>
	);
}

export default function UserList({
	users,
	type,
	hoverDelay,
	size,
	classNames,
	showBadge,
	Controls,
}: {
	users: User[];
	hoverDelay?: number;
	type: "list" | "grid";
	size?: "xs" | "sm" | "md";
	classNames?: ClassNames;
	showBadge?: (user: User) => boolean;
	Controls?: ({ user }: { user: User }) => any;
}) {
	if (type == "list")
		return (
			<div className={twMerge(`flex flex-col gap-2`, classNames?.list)}>
				{users?.length == 0 && <NoData />}
				{users?.map((user, i) => (
					<UserListListEntry
						hoverDelay={hoverDelay}
						key={user.id}
						Controls={Controls}
						classNames={classNames}
						size={size}
						user={user}
						showBadge={showBadge}
					/>
				))}
			</div>
		);

	return (
		<div
			className={twMerge(
				`h-46 grid grid-cols-7 gap-2`,
				users.length == 0 && "grid-cols-1",
			)}
		>
			{users?.length == 0 && <NoData />}
			{users?.map((user, i) => (
				<UserListGridEntry
					hoverDelay={hoverDelay}
					key={user.id}
					user={user}
				/>
			))}
		</div>
	);
}
