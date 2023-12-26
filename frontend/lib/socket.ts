import io from 'socket.io-client';

const backendSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
	withCredentials: true,
})

export default backendSocket;