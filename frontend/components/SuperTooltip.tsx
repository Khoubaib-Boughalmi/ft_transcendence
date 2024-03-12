"use client";
import { Tooltip } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";

export default function SuperTooltip({
	children, ...props
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
