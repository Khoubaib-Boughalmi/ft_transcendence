import { twMerge } from "tailwind-merge";

export default function Divider({
	orientation = "horizontal",
	className,
}: {
	orientation?: "horizontal" | "vertical";
	className?: string;
}) {
	return (
		<div
			data-orientation={orientation}
			className={twMerge(
				"h-[1px] w-[1px] bg-background-900 mix-blend-soft-light data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full",
				className,
			)}
		></div>
	);
}
