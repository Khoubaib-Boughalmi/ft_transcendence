import { useContext, useRef, useState } from "react";
import { Button } from "./Button";
import PublicContext from "@/contexts/PublicContext";
import { useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing } from "@/lib/utils";

export default function UploadButton({
	children,
	name,
    endpoint,
	...props
}: React.ComponentProps<typeof Button> & {
	name: "avatar" | "banner" | "icon";
    endpoint: string;
}) {
	const ref = useRef<HTMLLabelElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	const handleUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const file = formData.get(name);
		if (file)
			useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
				endpoint,
				formData,
				setLoading,
				`Successfully changed ${name}`,
				`Failed to change ${name}`,
				sessionMutate,
			);
		formRef.current?.reset();
	};

	return (
		<>
			<form ref={formRef} onChange={handleUpload} className="hidden">
				<input type="file" name={name} id={name} className="hidden" />
				<label ref={ref} htmlFor={name}></label>
			</form>
			<Button
				{...props}
				loading={loading}
				onClick={() => {
					if (ref.current) ref.current.click();
				}}
			>
				{children}
			</Button>
		</>
	);
}