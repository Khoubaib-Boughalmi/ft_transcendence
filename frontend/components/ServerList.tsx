"use client";

import { useChatContext } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";
import {
	AirVent,
	ArrowLeft,
	ArrowRight,
	Check,
	Compass,
	Globe,
	Globe2,
	LogOut,
	MailPlus,
	Menu,
	MessageSquarePlus,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	SendHorizontal,
	Server as ServerIcon,
	Settings2,
	Sparkles,
	Trash2,
	UserPlus2,
	Users2,
	X,
} from "lucide-react";
import { ScrollShadow } from "@nextui-org/react";
import ServerListEntry from "./ServerListEntry";
import ServerCreateButton from "./ServerCreateButton";

export default function ServerList() {
	const { expanded, setExpanded, listTab, setListTab, servers } =
		useChatContext();
	const listRef = useRef<HTMLDivElement>(null);
	const [realListTab, setRealListTab] = useState(listTab);
	const prev = useRef(listTab);

	useEffect(() => {
		const doc = document as any;
		if (doc.startViewTransition && prev.current != listTab)
			doc.startViewTransition(() => setRealListTab(listTab));
		else setRealListTab(listTab);
		prev.current = listTab;
	}, [listTab]);

	return (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-l-3xl bg-card-300 @md:w-[19rem]">
			<div
				className={twMerge(
					"flex h-24 w-full select-none bg-card-300 p-0 transition-all",
					expanded && "p-4",
				)}
			>
				<div
					className={twMerge(
						"flex w-full overflow-hidden rounded-none transition-all",
						expanded && "rounded-[2rem]",
					)}
				>
					<Button
						variant="transparent"
						onClick={() => {
							setExpanded(!expanded);
						}}
						className="flex aspect-[85/100]  h-full flex-shrink-0 items-center justify-center rounded-none rounded-tl-3xl !outline-none !ring-0"
					>
						{expanded ? <ArrowLeft /> : <Menu />}
					</Button>
					<div className="flex flex-1 bg-card-250">
						{[
							["servers", ServerIcon, "Channels"],
							["friends", Users2, "DMs"],
						].map(([tab, Icon, text]: any) => (
							<Button
								key={tab}
								variant="transparent"
								onClick={() => {
									setListTab(tab);
								}}
								className={twMerge(
									"flex-1 flex-col gap-1 rounded-none text-xs !outline-none !ring-0",
									tab != listTab && "opacity-50",
								)}
							>
								<Icon size={18} />
								<span>{text}</span>
							</Button>
						))}
					</div>
				</div>
			</div>
			<div className="relative flex-1">
				<div className="absolute inset-0 overflow-clip" ref={listRef}>
					<ScrollShadow size={64} className={"h-full w-full"}>
						{servers
							?.filter((server) => {
								if (realListTab == "servers")
									return !server.isDM;
								if (realListTab == "friends")
									return server.isDM;
							})
							.map((server, i) => (
								<ServerListEntry key={i} server={server} />
							))}
						<ServerCreateButton />
						{/* <ServerListEntry /> */}
					</ScrollShadow>
				</div>
			</div>
		</div>
	);
}