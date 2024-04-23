import React, { use, useEffect, useRef } from "react";

import socket from "@/lib/socket";
import { hostname } from "os";

export const StartGameComponent = ({
	startGame,
	setStartGame,
	HostReady,
	setHostReady,
	OppReady,
	setOppReady,
	mTheHost,
	gameId,
	...props
}) => {
	const canvasRef = useRef(null);

	const handleStartGame = () => {
		socket.emit("playerIsReady", { mTheHost: mTheHost, gameId: gameId });

		// Implement your game starting logic here
		console.log("Game started!");
		// socket.emit("start_game");
		// setStartGame(true);
		if (mTheHost) {
			setHostReady(true);
		}
		if (!mTheHost) {
			setOppReady(true);
		}
	};

	useEffect(() => {
		console.log("HostReady", HostReady);
		console.log("OppReady", OppReady);

		if (HostReady && OppReady) {
			socket.emit("start_game");
			setStartGame(true);
		}
	}, [HostReady, OppReady]);

	return (
		<div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
			<div className="flex h-screen items-center justify-center bg-gray-200">
				<div className="rounded-lg bg-white shadow-lg">
					<div className="p-8">
						<div className="text-center">
							<div className="mb-4 flex items-center justify-center">
								<h2 className="mr-2 text-lg font-bold ">
									Player 1
								</h2>
								<span
									className={`rounded-full px-2 py-1 text-sm ${HostReady ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
								>
									{HostReady ? "Ready" : "Not Ready"}
								</span>
							</div>
							<div className="flex items-center justify-center">
								<h2 className="mr-2 text-lg font-bold">
									Player 2
								</h2>
								<span
									className={`rounded-full px-2 py-1 text-sm ${OppReady ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
								>
									{OppReady ? "Ready" : "Not Ready"}
								</span>
							</div>
							<p className="mt-4 text-sm text-gray-500">
								Waiting...
							</p>
						</div>
						<div className="mt-4 flex justify-center">
							<button
								onClick={handleStartGame}
								className="focus:shadow-outline rounded-lg bg-green-500 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-600 focus:outline-none"
							>
								Start Game
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StartGameComponent;
