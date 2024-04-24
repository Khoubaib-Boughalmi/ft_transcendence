import { Spinner } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
	children?: React.ReactNode;
	iconOnly?: boolean;
	startContent?: React.ReactNode;
	endContent?: React.ReactNode;
	variant?: "default" | "secondary" | "danger" | "transparent" | "ghost";
	as?: "button" | "a";
	disabled?: boolean;
	className?: string;
	loading?: boolean;
} & (
	| React.ButtonHTMLAttributes<HTMLButtonElement>
	| React.AnchorHTMLAttributes<HTMLAnchorElement>
);

export function Button({
	children,
	iconOnly = false,
	startContent,
	endContent,
	variant = "default",
	as: As = "button",
	disabled,
	className,
	loading,
	...props
}: ButtonProps) {
	const isDisabled = loading || !!disabled;

	return (
		<As
			disabled={isDisabled}
			data-disabled={isDisabled}
			className={twMerge(
				`flex items-center justify-center gap-2 
				truncate rounded-3xl bg-gradient-to-t from-primary-400 to-primary-600
				p-2 px-4 text-sm
				text-black
				shadow
				transition-all
				duration-300 focus-within:ring-2 focus-within:ring-primary-400
				focus:outline-none active:scale-95 data-[disabled=false]:hover:brightness-110`,
				variant != "default" && "text-white",
				variant == "secondary" && "from-secondary-400 to-secondary-600",
				variant == "danger" && "from-red-700 to-red-500",
				variant == "ghost" && "from-white/10 to-white/10",
				variant == "transparent" &&
					"from-white/0 to-white/0 shadow-none data-[disabled=false]:hover:from-white/10 data-[disabled=false]:hover:to-white/10",
				iconOnly && "p-2",
				isDisabled && "cursor-not-allowed opacity-50",
				className,
			)}
			{...(props as React.ButtonHTMLAttributes<HTMLButtonElement> &
				React.AnchorHTMLAttributes<HTMLAnchorElement>)}
		>
			{loading ? <Spinner className={twMerge(variant == "default" && "invert")} size="sm" /> : startContent}
			{children}
			{endContent}
		</As>
	);
}
