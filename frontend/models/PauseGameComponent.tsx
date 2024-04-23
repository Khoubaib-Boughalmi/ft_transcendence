import React, { useRef } from "react";

import socket from "@/lib/socket";

export const PauseGameComponent = (props) => {
	const canvasRef = useRef(null);

	const handlePauseGame = () => {
		// Implement your game starting logic here
		console.log("handlePauseGame");
		socket.emit("start_game");
		props.setStartGame(false);
	};

	return (
		<div className="absolute right-0 top-0 z-10 flex flex-col items-center ">
			<button
				onClick={handlePauseGame} // Replace with your pause function
				className="focus:shadow-outline rounded-lg bg-red-500 px-6 py-3 font-bold text-white shadow-lg hover:bg-red-600 focus:outline-none "
			>
				Pause Game
			</button>
		</div>
	);
};

export default PauseGameComponent;
	