import PublicContext from "@/contexts/PublicContext";
import { useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { Button } from "./Button";

export default function DeleteButton({
	type,
    endpoint,
	children,
}: {
	type: "avatar" | "banner" | "icon";
    endpoint: string;
	children?: React.ReactNode;
}) {
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	const handleImageDelete = async () => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			endpoint,
			null,
			setLoading,
			`Successfully deleted ${type}`,
			`Failed to delete ${type}`,
			sessionMutate,
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