import { useIsOnline } from "@/lib/utils";
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
	isOnline?: boolean;
}) {
	const response = useIsOnline(isOnline ? null : userId);
	const or = isOnline ?? response;
	const status = or == true ? "Online" : "Offline";

	return (
		<div
			data-size={size}
			data-status={status}
			className={twMerge(
				`group flex select-none items-center gap-1 rounded-3xl bg-green-600 px-1
					text-[0.65rem] data-[size=xs]:gap-0.5
				 data-[status=Busy]:bg-red-600 data-[status=Offline]:bg-gray-600 data-[size=sm]:text-[0.55rem] data-[size=xs]:text-[0.5rem]`,
				className,
			)}
		>
			<div
				className="aspect-square h-2 w-2 rounded-full
				bg-green-400 group-data-[size=xs]:h-1.5
				group-data-[size=xs]:w-1.5
				group-data-[status=Busy]:bg-red-400
				 group-data-[status=Offline]:bg-gray-400"
			></div>
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
