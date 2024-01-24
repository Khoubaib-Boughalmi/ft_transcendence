import { User } from "@/types/profile";
import ModalSet from "./ModalSet";
import MessageInput from "./MessageInput";
import socket from "@/lib/socket";

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

	return (
		<ModalSet
			onOpen={onOpen}
			onClose={onClose}
			onOpenChange={onOpenChange}
			isOpen={isOpen}
			title={`Message ${user.username}`}
			size="2xl"
		>
			<form className="p-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const message = (formData.get("message") as string).trim();
                if (!message) return;
                if (message?.length < 1) return;
				console.log("emitted")
                socket.emit("message", {
                    chatId: user.id,
                    message
                })
            }}>
				<MessageInput />
			</form>
		</ModalSet>
	);
}
