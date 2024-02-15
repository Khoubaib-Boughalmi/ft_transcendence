"use client";

import { useChatContext } from "@/lib/utils";
import { Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";

export default function ServerCreateButton() {
	const router = useRouter();
	const { expanded, serversMutate, servers, setExpanded } = useChatContext();

	return (
		<Button
			style={
				expanded
					? {
							viewTransitionName: "create",
						}
					: {}
			}
			onClick={() => {
				router.push("/chat/discover");
				setExpanded(false);
			}}
			variant="transparent"
			className={twMerge(
				"left-20 flex h-20 w-full justify-start gap-0 rounded-none !bg-transparent p-0 !outline-0 !ring-0 hover:!from-transparent hover:!to-transparent",
				expanded && "h-24 p-4",
			)}
		>
			<div
				className={twMerge(
					"flex h-full w-full bg-card-100 transition-all hover:bg-white/10",
					expanded && "rounded-[100px] px-2",
				)}
			>
				<div className="relative aspect-square h-full flex-shrink-0">
					<div className="relative flex h-full w-full items-center justify-center rounded-2xl">
						<Compass size={32} strokeWidth={1.25} />
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
							Discover
						</div>
						{/* <div className="text-xs text-foreground-500 truncate max-w-full"></div> */}
					</div>
				</div>
			</div>
		</Button>
	);
}
