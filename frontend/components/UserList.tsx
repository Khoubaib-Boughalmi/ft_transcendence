"use client";
import { useIsOnline } from "@/lib/utils";
import { User } from "@/types/profile";
import { Tooltip, useDisclosure } from "@nextui-org/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import NoData from "./NoData";
import Status from "./Status";
import SuperImage from "./SuperImage";
import UserHover from "./UserHover";
import { ReactNode, useEffect, useMemo, useState } from "react";
import ContextMenuTrigger from "./ContextMenuTrigger";

type ClassNames = {
	list?: string;
	entry?: string;
	entryContainer?: string;
};

function SuperTooltip({
	children,
	...props
}: React.ComponentProps<typeof Tooltip>) {
	return (
		<Tooltip
			className={twMerge("bg-card-200 p-2", props.className)}
			radius="lg"
			classNames={{
				arrow: twMerge("", props.classNames?.arrow),
				base: twMerge("", props.classNames?.base),
				content: twMerge("", props.classNames?.content),
			}}
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
			isDismissable={true}
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
	showHover,
	contextContent,
	setOnlineStates,
	entryProps,
}: {
	user: User;
	hoverDelay?: number;
	size?: "xs" | "sm" | "md";
	classNames?: ClassNames;
	entryProps?: React.HTMLProps<HTMLAnchorElement>;
	Controls?: any;
	showBadge?: (user: User) => string | null;
	showHover?: boolean;
	contextContent?: (user: User) => ReactNode;
	setOnlineStates: any;
}) {
	const badge = showBadge && showBadge(user);
	const isOnline = useIsOnline(user.id, setOnlineStates);

	return (
		<SuperTooltip
			placement="left"
			delay={hoverDelay || 250}
			content={<UserHover user={user} />}
			isDisabled={!showHover}
			isDismissable={true}
		>
			<div>
				<ContextMenuTrigger
					isDisabled={!contextContent}
					menuContent={contextContent ? contextContent(user) : null}
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
							!Controls &&
							isOnline == false &&
							"brightness-[60%]",
							size == "xs" && "gap-2",
							classNames?.entry,
						)}
						{...entryProps}
						ref={null}
					>
						{badge && (
							<div className="absolute left-0 top-0 z-10">
								<img
									src={badge}
									className="h-3 w-3 object-cover"
								/>
							</div>
						)}
						<div className="flex h-full w-full items-center gap-3 overflow-hidden">
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
				</ContextMenuTrigger>
			</div>
		</SuperTooltip>
	);
}

export default function UserList({
	users,
	type,
	hoverDelay,
	size,
	entryProps,
	classNames,
	showBadge,
	Controls,
	contextContent,
	showHover = true,
}: {
	users: User[];
	hoverDelay?: number;
	type: "list" | "grid";
	size?: "xs" | "sm" | "md";
	entryProps?: React.HTMLProps<HTMLAnchorElement>;
	classNames?: ClassNames;
	showBadge?: (user: User) => string | null;
	Controls?: ({ user }: { user: User }) => any;
	showHover?: boolean;
	contextContent?: (user: User) => ReactNode;
}) {
	const [onlineStates, setOnlineStates] = useState<Map<string, boolean>>(
		new Map(),
	);

	const sortedUsers = useMemo(() => {
		return users.toSorted((a, b) => {
			if (onlineStates.get(a.id) && !onlineStates.get(b.id)) return -1;
			if (!onlineStates.get(a.id) && onlineStates.get(b.id)) return 1;
			return 0;
		});
	}, [users, onlineStates]);

	if (type == "list")
		return (
			<div
				className={twMerge(
					`flex flex-col gap-2 overflow-x-hidden`,
					classNames?.list,
				)}
			>
				{sortedUsers?.length == 0 && <NoData />}
				{sortedUsers?.map((user, i) => (
					<UserListListEntry
						hoverDelay={hoverDelay}
						key={user.id}
						Controls={Controls}
						classNames={classNames}
						size={size}
						user={user}
						showBadge={showBadge}
						showHover={showHover}
						contextContent={contextContent}
						setOnlineStates={setOnlineStates}
						entryProps={entryProps}
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
