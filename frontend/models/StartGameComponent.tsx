import React, { useRef } from "react";

import socket from "@/lib/socket";

export const StartGameComponent = (props) => {
	const canvasRef = useRef(null);

	const handleStartGame = () => {
		// Implement your game starting logic here
		console.log("Game started!");
		socket.emit("start_game");
		props.setStartGame(true);
	};

	return (
		<div className="absolute inset-0 z-10 flex flex flex-col items-center items-center justify-center">
			<button
				onClick={handleStartGame}
				className="focus:shadow-outline rounded-lg bg-green-500 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-600 focus:outline-none "
			>
				Start Game
			</button>
		</div>
	);
};

export default StartGameComponent;
