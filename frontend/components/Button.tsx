import { twMerge } from "tailwind-merge";

type ButtonProps = {
	children?: React.ReactNode;
	iconOnly?: boolean;
	startContent?: React.ReactNode;
	variant?: "default" | "secondary" | "danger" | "transparent" | "ghost";
	as?: "button" | "a";
	className?: string;
} & (
	| React.ButtonHTMLAttributes<HTMLButtonElement>
	| React.AnchorHTMLAttributes<HTMLAnchorElement>
);

export function Button({
	children,
	iconOnly = false,
	startContent,
	variant = "default",
	as: As = "button",
	className,
	...props
}: ButtonProps) {
	return (
		<As
			className={twMerge(
				`flex items-center justify-center gap-2 
				truncate rounded-3xl bg-gradient-to-t from-primary-400 to-primary-600
				p-2 px-4 text-sm
				text-black
				shadow
				transition-all
				duration-300 focus-within:ring-2 focus-within:ring-primary-400
				hover:brightness-110 focus:outline-none active:scale-95`,
				variant != "default" && "text-white",
				variant == "secondary" && "from-secondary-400 to-secondary-600",
				variant == "danger" && "from-red-700 to-red-500",
				variant == "ghost" && "from-white/10 to-white/10",
				variant == "transparent" &&
					"from-white/0 to-white/0 shadow-none hover:from-white/10 hover:to-white/10",
				iconOnly && "p-2",
				className
			)}
			{...props as React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>}
		>
			{startContent}
			{children}
		</As>
	);
}
