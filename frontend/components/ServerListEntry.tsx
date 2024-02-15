"use client";
import { Button } from "@/components/Button";
import Status from "@/components/Status";
import SuperImage from "@/components/SuperImage";
import PublicContext from "@/contexts/PublicContext";
import { useChatContext } from "@/lib/utils";
import { Server } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

export default function ServerListEntry({ server }: { server: Server }) {
	const router = useRouter();
	const { session } = useContext(PublicContext) as any;
	const { expanded, selectedServerId, navigateToServer } = useChatContext();

	return (
		<Button
			onClick={() => {
				navigateToServer(server.id);
			}}
			variant="transparent"
			className={twMerge(
				"left-20 flex h-20 w-full justify-start gap-0 rounded-none p-0 pr-4 !outline-0 !ring-0	",
				selectedServerId == server.id && "bg-card-400",
			)}
		>
			<div className="relative aspect-square h-full flex-shrink-0 p-4">
				<div className="relative aspect-square h-full">
					<SuperImage
						width={64}
						height={64}
						alt={server.name}
						src={server.icon}
						className={twMerge(
							"absolute inset-0 aspect-square h-full w-full rounded-2xl object-cover",
							server.isDM && "rounded-full",
						)}
					/>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				<div
					className={twMerge(
						"flex h-full flex-col items-start justify-center overflow-hidden",
						expanded && "animate-lefttoright",
						!expanded && "animate-righttoleft",
					)}
				>
					<div className="max-w-full truncate text-sm">
						{server.name}
					</div>
					{!server.isDM ? (
						<div className="max-w-full truncate text-xs text-foreground-500">
							{server.description}
						</div>
					) : (
						<Status
							userId={
								server.membersIds.find(
									(id) => id != session.id,
								) || ""
							}
						/>
					)}
				</div>
			</div>
		</Button>
	);
}
