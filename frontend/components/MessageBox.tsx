import { User } from "@/types/profile";
import ModalSet from "./ModalSet";
import MessageInput from "./MessageInput";
import socket from "@/lib/socket";
import { randomString, useServerList } from "@/lib/utils";
import { useContext } from "react";
import PublicContext from "@/contexts/PublicContext";
import { useRouter } from "next/navigation";
import { Server } from "@/types/chat";

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
			<form className="p-4" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const message = (formData.get("message") as string).trim();
                if (!message) return;
                if (message?.length < 1) return;
				setExpecting(true);
				// wait until the server list is loaded
				while (serversLoading) {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
                socket.emit("message", {
                    targetId: user.id,
					queueId: randomString(),
                    message
                })

				// if a dm with the user exists, get its id
				const dm = servers.find((s: Server) => s.isDM && s.membersIds.includes(user.id));
				if (dm)
					router.push(`/chat/channel/${dm.id}`);
				else
					router.push(`/chat/discover`);
            }}>
				<MessageInput />
			</form>
		</ModalSet>
	);
}
