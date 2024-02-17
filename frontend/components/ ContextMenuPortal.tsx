import { useEffect, useRef, useState } from "react";
import ContextMenuContext from "@/contexts/ContextMenuContext";

export default function ContextMenuPortal({
	children,
}: {
	children: React.ReactNode;
}) {
	const [contextMenu, setContextMenu] = useState<React.ReactNode>(null);
	const [materializePosition, setMaterializePosition] = useState(null) as any;
	const mousePosition = useRef({ x: 0, y: 0 });
	const ref = useRef<HTMLDivElement>(null);
	const closeMenu = () => {
		setContextMenu(null);
		setMaterializePosition(null);
	};

	useEffect(() => {

		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				closeMenu();
			}
		};

		const onRightClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				ref.current &&
				!ref.current.contains(e.target as Node) &&
				!target.closest("[data-context]")
			) {
				closeMenu();
			}
		};

		const onMouseMove = (e: MouseEvent) => {
			mousePosition.current = { x: e.clientX, y: e.clientY };
		};

		window.addEventListener("click", onClick);
		window.addEventListener("contextmenu", onRightClick);
		window.addEventListener("mousemove", onMouseMove);
		return () => {
			window.removeEventListener("click", onClick);
			window.removeEventListener("contextmenu", onRightClick);
			window.removeEventListener("mousemove", onMouseMove);
		};
	}, []);

	return (
		<>
			{contextMenu && materializePosition && (
				<div
					ref={ref}
					style={{
						top: materializePosition.y,
						left: materializePosition.x,
					}}
					className="absolute z-50 animate-popup"
					data-context-menu
					key={JSON.stringify(materializePosition)}
					onContextMenu={(e) => {
						setContextMenu(null);
						setMaterializePosition(null);
					}}
				>
					{contextMenu}
				</div>
			)}
			<ContextMenuContext.Provider
				value={{
					setContextMenu,
                    setMaterializePosition,
					materializePosition,
					closeMenu,
				}}
			>
				{children}
			</ContextMenuContext.Provider>
		</>
	);
}
