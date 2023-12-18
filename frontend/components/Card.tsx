"use client";
import { ReactNode } from "react";
import Divider from "@/components/Divider";
import { twMerge } from "tailwind-merge";

export default function Card({
	header, children, footer, color = "bg-card-300", fullWidth = false, className, skeleton, ...props
}: {
	header?: ReactNode;
	children?: ReactNode;
	footer?: ReactNode;
	color?: string;
	fullWidth?: boolean;
	className?: string;
	skeleton?: ReactNode;
	[key: string]: any;
}) {
	return (
		<div
			{...props}
			data-full-width={fullWidth}
			className={twMerge(`flex flex-col rounded-3xl ${color} z-10 data-[full-width=true]:w-full`, className
			)}
		>
			{skeleton}
			{header && (
				<>
					<div className="flex flex-shrink-0 p-4 font-medium text-white ">
						{header}
					</div>
					<Divider />
				</>
			)}

			<div className="flex-1 p-2 text-background-800">{children}</div>

			{footer && (
				<>
					<Divider />
					<div className="flex flex-shrink-0 p-4 text-white">
						{footer}
					</div>
				</>
			)}
		</div>
	);
}
