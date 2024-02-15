import PublicContext from "@/contexts/PublicContext";
import { useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing } from "@/lib/utils";
import { useContext, useRef, useState } from "react";
import { Button } from "./Button";

export default function UploadButton({
	children,
	name,
	endpoint,
	data,
	callback,
	...props
}: React.ComponentProps<typeof Button> & {
	name: "avatar" | "banner" | "icon";
	endpoint: string;
	data?: any;
	callback?: any;
}) {
	const ref = useRef<HTMLLabelElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	const postCallback = async () => {
		if (callback) await callback();
		await sessionMutate();
	};

	const handleUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const file = formData.get(name);
		if (data)
			for (const [key, value] of Object.entries(data) as any)
				formData.append(key, value);

		if (file)
			useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
				endpoint,
				formData,
				setLoading,
				`Successfully changed ${name}`,
				`Failed to change ${name}`,
				postCallback,
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
