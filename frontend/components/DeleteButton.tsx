import PublicContext from "@/contexts/PublicContext";
import { useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { Button } from "./Button";

export default function DeleteButton({
	type,
    endpoint,
	children,
	data,
	callback
}: {
	type: "avatar" | "banner" | "icon";
    endpoint: string;
	children?: React.ReactNode;
	data?: any;
	callback?: any;
}) {
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	
	const postCallback = async () => {
		if (callback) await callback();
		await sessionMutate();
	}
	
	const handleImageDelete = async () => {
		const formData = new FormData();
		if (data)
			for (const [key, value] of Object.entries(data) as any)
				formData.append(key, value);
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			endpoint,
			formData,
			setLoading,
			`Successfully deleted ${type}`,
			`Failed to delete ${type}`,
			postCallback,
		);
	};

	return (
		<Button
			loading={loading}
			onClick={handleImageDelete}
			variant="transparent"
			iconOnly
		>
			<Trash2 />
			{children}
		</Button>
	);
}