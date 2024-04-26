import { useIsOnline } from "@/lib/utils";
import { UserStatus } from "@/types/profile";
import { Gamepad2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

export default function Status({
	userId,
	size,
	className,
	isOnline,
}: {
	userId: string;
	size?: "xs" | "sm" | "md" | "lg";
	className?: string;
	isOnline?: UserStatus;
}) {
	const response = useIsOnline(isOnline ? null : userId);
	const or = isOnline ?? response;
	const status = or;

	return (
		<div
			data-size={size}
			data-status={status}
			className={twMerge(
				`group flex select-none items-center gap-1 rounded-3xl bg-green-600 px-2 py-0.5
					text-[0.65rem] data-[size=xs]:gap-0.5
				 data-[status=Playing]:bg-red-600 data-[status=Offline]:bg-gray-600 data-[size=sm]:text-[0.55rem] data-[size=xs]:text-[0.5rem]`,
				className,
			)}
		>
			{status == "Playing" ? <Gamepad2 size={size == "xs" ? 8 : 12} /> : <div
				className="aspect-square h-2 w-2 rounded-full
				bg-green-400 group-data-[size=xs]:h-1.5
				group-data-[size=xs]:w-1.5
				group-data-[status=Playing]:bg-red-400
				 group-data-[status=Offline]:bg-gray-400"
			></div>}
			<div
				className="group-data-[size=sm]:leading-4
			group-data-[size=xs]:leading-[0.8rem]
			"
			>
				{status}
			</div>
		</div>
	);
}
