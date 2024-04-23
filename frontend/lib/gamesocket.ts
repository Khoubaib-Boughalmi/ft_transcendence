import io from "socket.io-client";

const gameSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game`, {
	withCredentials: true,
});

export default gameSocket;
