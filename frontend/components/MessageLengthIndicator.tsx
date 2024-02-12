import { Tooltip } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";

export default function MessageLengthIndicator({
	message,
	maxMessageLength,
	showTooltip,
}: {
	showTooltip?: boolean;
	message: string;
	maxMessageLength: number;
}) {
	const diff = maxMessageLength - message.length;
	const appear = diff < maxMessageLength / 2;

	return (
		<Tooltip
			isOpen={showTooltip == true ? true : undefined}
			showArrow
			isDisabled={!appear}
			content={`${diff} characters remaining`}
			placement="top"
		>
			<div
				className={twMerge(
					"flex h-3/5 w-0 select-none items-center justify-center overflow-hidden rounded-full bg-card-100 text-xs text-white opacity-0 transition-all hover:bg-card-300",
					appear && "w-12 opacity-100",
					diff <= 0 && "animate-pulse bg-card-600 hover:bg-card-600",
				)}
			>
				{maxMessageLength - message.length}
			</div>
		</Tooltip>
	);
}
