import { maxMessageLength } from "@/constants/chat";
import PublicContext from "@/contexts/PublicContext";
import socket from "@/lib/socket";
import { randomString, useServerList } from "@/lib/utils";
import { Server } from "@/types/chat";
import { User } from "@/types/profile";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import MessageInput from "./MessageInput";
import MessageLengthIndicator from "./MessageLengthIndicator";
import ModalSet from "./ModalSet";

export default function MessageBox({
	user,
	onOpen,
	onClose,
	onOpenChange,
	isOpen,
}: {
	user: User;
	onOpen: any;
	onClose: any;
	onOpenChange: any;
	isOpen: any;
}) {
	const [message, setMessage] = useState("");
	const { servers, serversLoading } = useServerList();
	const { setExpecting } = useContext(PublicContext) as any;
	const router = useRouter();

	return (
		<ModalSet
			onClose={onClose}
			onOpenChange={onOpenChange}
			isOpen={isOpen}
			title={`Message ${user.username}`}
			size="2xl"
		>
			<form
				className="p-4"
				onSubmit={async (e) => {
					e.preventDefault();
					onClose();
					const formData = new FormData(e.target as HTMLFormElement);
					const message = (formData.get("message") as string).trim();
					if (!message) return;
					if (message?.length < 1) return;
					// wait until the server list is loaded
					while (serversLoading) {
						await new Promise((resolve) =>
							setTimeout(resolve, 100),
						);
					}

					// if a dm with the user exists, get its id
					const dm = servers.find(
						(s: Server) => s.isDM && s.membersIds.includes(user.id),
					);
					if (dm) router.push(`/chat/channel/${dm.id}`);
					else {
						setExpecting(true);
						socket.emit("message", {
							targetId: user.id,
							queueId: randomString(),
							message,
						});
						router.push(`/chat/discover`);
					}
				}}
			>
				<MessageInput
					startContent={
						<MessageLengthIndicator
							message={message}
							maxMessageLength={maxMessageLength}
						/>
					}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
			</form>
		</ModalSet>
	);
}
