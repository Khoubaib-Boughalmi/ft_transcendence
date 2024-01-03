import { fetcher } from "@/lib/utils";
import { StatusType, User } from "@/types/profile";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";

export default function Status({
	user,
	size,
	className,
}: {
	user: User;
	size?: "xs" | "sm" | "md" | "lg";
	className?: string;
}) {
	const { data } = useSWR(`/user/profile/isonline/${user.id}`, fetcher, {
		refreshInterval: 1000,
	}) as any;
	let status = null;

	if (data?.isOnline != null)
		status = data.isOnline == true ? "Online" : "Offline";
	else
		status = user.status;

	return (
		<div
			data-size={size}
			data-status={status}
			className={twMerge(
				`group flex select-none items-center gap-1 rounded-3xl bg-green-600 px-1
					data-[size=xs]:text-[0.5rem] data-[size=xs]:gap-0.5
				 text-[0.65rem] data-[status=Busy]:bg-red-600 data-[status=Offline]:bg-gray-600 data-[size=sm]:text-[0.55rem]`,
				className,
			)}
		>
			<div
				className="aspect-square h-2 w-2 rounded-full
				group-data-[size=xs]:h-1.5 group-data-[size=xs]:w-1.5
				bg-green-400
				group-data-[status=Busy]:bg-red-400
				 group-data-[status=Offline]:bg-gray-400"
			></div>
			<div className="group-data-[size=sm]:leading-4
			group-data-[size=xs]:leading-[0.8rem]
			">{status}</div>
		</div>
	);
}
