import { useContextMenu } from "@/lib/utils";
import { ReactNode } from "react";

export default function ContextMenuTrigger({
	menuContent,
	children,
	isDisabled = false,
	...props
}: {
	menuContent: ReactNode;
	isDisabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
	const {
		setContextMenu,
		setMaterializePosition,
		materializePosition,
		closeMenu,
	} = useContextMenu();

	const handleContextMenu = (e: React.MouseEvent) => {
		if (isDisabled) return;

		const target = e.target as HTMLElement;
		if (
			!target.closest("[data-context-menu]") &&
			(materializePosition === null ||
				!(
					Math.abs(materializePosition.x - e.clientX) <= 0 &&
					Math.abs(materializePosition.y - e.clientY) <= 0
				))
		) {
			e.preventDefault();
			setContextMenu(menuContent);
			setMaterializePosition({ x: e.clientX + 0, y: e.clientY + 0 });
		} else closeMenu();
	};

	return isDisabled ? (
		<div {...props}>{children}</div>
	) : (
		<div {...props} onContextMenu={handleContextMenu} data-context>
			{children}
		</div>
	);
}
