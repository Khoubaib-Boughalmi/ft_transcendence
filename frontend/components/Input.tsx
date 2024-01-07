"use client";
import { start } from "repl";
import { twMerge } from "tailwind-merge";

export default function Input({
	classNames,
	startContent,
	disabled,
	endContent,
	...props
}: {
	classNames?: { container?: string; input?: string };
	startContent?: React.ReactNode;
	endContent?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div
			data-disabled={disabled == true}
			className={twMerge(
				`data-[disabled=true]:after:content:[''] relative flex h-full w-full items-center justify-center gap-2 overflow-hidden rounded-3xl bg-white/10 px-4 pl-2 text-sm text-white shadow transition-all duration-300 file:data-[disabled=false]:h-full data-[disabled=true]:after:absolute data-[disabled=true]:after:inset-0
				data-[disabled=true]:after:bg-black/40 focus-within:data-[disabled=false]:ring-2 focus-within:data-[disabled=false]:ring-primary-400 hover:data-[disabled=false]:brightness-110 active:data-[disabled=false]:scale-[99%]`,
				classNames?.container,
				!startContent && "pl-4",
			)}
		>
			{startContent}
			<input
				disabled={disabled == true}
				className={twMerge(
					"min-w-0 flex-1 bg-transparent text-white placeholder-white/50 outline-none",
					classNames?.input,
				)}
				autoComplete="off"
				{...props}
			/>
			{endContent}
		</div>
	);
}
