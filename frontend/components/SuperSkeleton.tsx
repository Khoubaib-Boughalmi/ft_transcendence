import { Skeleton } from "@nextui-org/react";
import { useEffect, useState } from "react";

export function SuperSkeleton({
	isLoaded,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	const [render, setRender] = useState(true);

	useEffect(() => {
		if (isLoaded) {
			setTimeout(() => {
				setRender(false);
			}, 300);
		}
	}, [isLoaded]);

	return <>{render && <Skeleton isLoaded={isLoaded} {...props} />}</>;
}
