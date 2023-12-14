import { Status } from "@/types/profile";

export default function Status({
	status,
	size,
}: {
	status: Status;
	size?: "sm" | "md" | "lg";
}) {
	return (
		<div
			data-size={size}
			data-status={status}
			className="group flex items-center gap-1 rounded-3xl bg-green-600 
				px-1
				text-[0.65rem]
				 data-[status=Busy]:bg-red-600 data-[status=Offline]:bg-gray-600 data-[size=sm]:text-[0.55rem]"
		>
			<div
				className="aspect-square h-2 w-2 rounded-full
				bg-green-400
				group-data-[status=Busy]:bg-red-400
				 group-data-[status=Offline]:bg-gray-400"
			></div>
			<div className="group-data-[size=sm]:leading-4">{status}</div>
		</div>
	);
}