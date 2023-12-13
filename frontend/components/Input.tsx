"use client";
import { twMerge } from 'tailwind-merge'

export default function Input({classNames, startContent, ...props }: { classNames?: { container?: string, input?: string }, startContent?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div className={twMerge("flex h-full w-full items-center justify-center gap-2 rounded-3xl bg-white/10 px-4 pl-2 text-sm text-white shadow transition-all duration-300 file:h-full focus-within:ring-2 focus-within:ring-primary-400 hover:brightness-110 active:scale-95", classNames?.container)}>
			{startContent}
			<input
				className={twMerge("flex-1 bg-transparent text-white placeholder-white/50 outline-none min-w-0", classNames?.input)}
				{...props} />
		</div>
	);
}
