"use client";
import { useChatContext } from "@/lib/utils";
import { twMerge } from "tailwind-merge";


export default function SectionContainer({ children }: any) {
	const { expanded } = useChatContext();

	return (
		<div
			className={twMerge(
				"absolute inset-0 flex translate-x-full flex-col overflow-hidden rounded-r-3xl bg-gradient-to-tr from-card-300 from-40% to-card-500 transition-all @md:left-20 @md:translate-x-0",
				expanded &&
					"translate-x-0 select-none brightness-50 @md:translate-x-56",
			)}
		>
			{children}
		</div>
	);
}