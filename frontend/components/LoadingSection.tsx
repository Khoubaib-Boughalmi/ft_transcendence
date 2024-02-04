"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import SectionContainer from "./SectionContainer";
import { Spinner } from "@nextui-org/react";

export default function LoadingSection({ isLoading }: { isLoading?: boolean }) {
	const [visible, setVisible] = useState(isLoading);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (isLoading == false)
			timeout = setTimeout(() => {
				setVisible(false);
			}, 500);
		else
			setVisible(true);
		return () => {
			clearTimeout(timeout);
		}
	}, [isLoading]);

	return (
		visible && (
			<div
				className={twMerge(
					"absolute inset-0 z-20 opacity-100 transition-opacity duration-500",
					!isLoading && "opacity-0",
					isLoading && "transition-none"
				)}
			>
				<SectionContainer>
					<div className="flex h-full w-full items-center justify-center">
						<Spinner />
					</div>
				</SectionContainer>
			</div>
		)
	);
}
