import { SendHorizontal } from "lucide-react";
import { Button } from "./Button";
import Input from "./Input";

export default function MessageInput(props: React.ComponentProps<typeof Input>) {
	return (
		<Input
			id="message"
			autoComplete="off"
			name="message"
			placeholder="Send a message"
			classNames={{
				container: "pr-0",
			}}
			endContent={
				<Button
					startContent={<SendHorizontal />}
					type="submit"
					variant="transparent"
					className="h-full rounded-none !border-0 px-4 !outline-none !ring-0"
					iconOnly
				></Button>
			}
            {...props}
		/>
	);
}