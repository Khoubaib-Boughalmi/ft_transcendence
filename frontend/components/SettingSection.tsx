import { twMerge } from "tailwind-merge";

export default function SettingSection({
	title,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={twMerge("flex w-full flex-col gap-2", className)}>
			<div className="text-sm">{title}</div>
			{children}
		</div>
	);
}
