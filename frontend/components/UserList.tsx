"use client";
import { useIsOnline } from "@/lib/utils";
import { User, UserStatus } from "@/types/profile";
import { useDisclosure } from "@nextui-org/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import NoData from "./NoData";
import Status from "./Status";
import SuperImage from "./SuperImage";
import UserHover from "./UserHover";
import { ReactNode, useEffect, useMemo, useState } from "react";
import ContextMenuTrigger from "./ContextMenuTrigger";
import SuperTooltip from "./SuperTooltip";

type ClassNames = {
	list?: string;
	entry?: string;
	entryContainer?: string;
};

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
					isOnline == "Offline" && "brightness-[60%]",
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
	endContent,
	showBadge,
	showHover,
	contextContent,
	setOnlineStates,
	entryProps,
	startContent,
}: {
	user: User;
	hoverDelay?: number;
	size?: "xs" | "sm" | "md";
	classNames?: ClassNames;
	entryProps?: React.HTMLProps<HTMLAnchorElement>;
	endContent?: ({ user }: { user: User }) => ReactNode;
	showBadge?: (user: User) => string | null;
	showHover?: boolean;
	contextContent?: ({ user }: { user: User }) => ReactNode;
	setOnlineStates: any;
	startContent?: ({ user }: { user: User }) => ReactNode;
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
					menuContent={
						contextContent ? contextContent({ user }) : null
					}
					className={twMerge(
						`flex h-16 w-full gap-4 rounded-xl bg-card-400 p-2 text-white transition-all`,
						size == "xs" && "h-12 gap-2",
						!endContent && isOnline == "Offline" && "brightness-[60%]",
						classNames?.entryContainer,
					)}
				>
					{startContent && startContent({ user })}
					<Link
						href={`/profile/${user.username}`}
						className={twMerge(
							`relative flex-1 gap-4 text-white
							transition-all hover:scale-105 hover:brightness-110`,
							!endContent &&
								isOnline == "Offline" &&
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
								{!endContent && (
									<Status
										isOnline={isOnline}
										size={size}
										userId={user.id}
									/>
								)}
							</div>
						</div>
					</Link>
					{endContent && endContent({ user })}
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
	endContent,
	contextContent,
	startContent,
	showHover = true,
}: {
	users: User[];
	hoverDelay?: number;
	type: "list" | "grid";
	size?: "xs" | "sm" | "md";
	entryProps?: React.HTMLProps<HTMLAnchorElement>;
	classNames?: ClassNames;
	showBadge?: (user: User) => string | null;
	endContent?: ({ user }: { user: User }) => ReactNode;
	showHover?: boolean;
	contextContent?: ({ user }: { user: User }) => ReactNode;
	startContent?: ({ user }: { user: User }) => ReactNode;
}) {
	const [onlineStates, setOnlineStates] = useState<Map<string, UserStatus>>(
		new Map(),
	);

	const sortedUsers = useMemo(() => {
		if (endContent) return users;
		return users.toSorted((a, b) => {
			const priority = ["Playing", "Online", "Offline"]
			console.log({a, b, astate: onlineStates.get(a.id), bstate: onlineStates.get(b.id)});
			if (priority.indexOf(onlineStates.get(a.id)) < priority.indexOf(onlineStates.get(b.id))) return -1;
			return 0;
		});
	}, [users, onlineStates]);

	console.log({
		users,
	});

	if (type == "list")
		return (
			<div
				className={twMerge(
					`flex flex-col gap-2 overflow-x-hidden`,
					classNames?.list,
				)}
			>
				{sortedUsers?.length == 0 && <NoData />}
				{sortedUsers?.map((user, i) => {
					console.log("Rendering", user);

					return (
						<UserListListEntry
							hoverDelay={hoverDelay}
							key={user.id + "-" + i}
							endContent={endContent}
							classNames={classNames}
							size={size}
							user={user}
							showBadge={showBadge}
							showHover={showHover}
							contextContent={contextContent}
							setOnlineStates={setOnlineStates}
							entryProps={entryProps}
							startContent={startContent}
						/>
					);
				})}
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
					key={i}
					user={user}
				/>
			))}
		</div>
	);
}
