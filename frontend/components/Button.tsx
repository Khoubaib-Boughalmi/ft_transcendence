export function Button({
	children,
	iconOnly = false,
	startContent,
	variant = "default",
	as: As = "button",
	...props
}: {
	children?: any;
	iconOnly?: boolean;
	startContent?: React.ReactNode;
	variant?: "default" | "secondary" | "danger" | "transparent" | "ghost";
	as?: "button" | "a";
	[key: string]: any;
}) {

	return (
		<As
			data-variant={variant}
			data-start-content={!!startContent}
			data-icon-only={iconOnly}
			className="flex items-center justify-center gap-2 
				rounded-3xl bg-gradient-to-t from-primary-400 to-primary-600 p-2
				px-4 text-sm shadow
				text-black
				transition-all
				duration-300
				focus-within:ring-2 focus-within:ring-primary-400 hover:brightness-110
				focus:outline-none active:scale-95 data-[variant=danger]:from-red-700
				data-[variant=ghost]:from-white/10 data-[variant=secondary]:from-secondary-400 data-[variant=transparent]:from-white/0 
				data-[variant=danger]:to-red-500 data-[variant=ghost]:to-white/10
				data-[variant=secondary]:to-secondary-600
				data-[variant=transparent]:to-white/0
				data-[icon-only=true]:p-2
				data-[variant=danger]:text-white data-[variant=ghost]:text-white data-[variant=secondary]:text-white data-[variant=transparent]:text-white
				data-[variant=transparent]:shadow-none
				data-[variant=transparent]:hover:from-white/10
				data-[variant=transparent]:hover:to-white/10
				truncate
				"
			{...props}
		>
			{startContent}
			{children}
		</As>
	);
}