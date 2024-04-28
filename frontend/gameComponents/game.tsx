"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useCallback, use } from "react";
import React from "react";
import { OrbitControls, PositionPoint } from "@react-three/drei";
import {
	Sky,
	Racket,
	Ball,
	Jball,
	Table,
	CameraController,
	PlaneTable,
} from "../models";
import { useFrame } from "@react-three/fiber";
import { Controls, useControl } from "react-three-gui";
import { Stats } from "@react-three/drei";

import socket from "@/lib/socket";

import { Debug, Physics, useCylinder, usePlane } from "@react-three/cannon";
import type { Group, Mesh } from "three";
import { User } from "@/types/profile";
import { user1, user2 } from "@/mocks/profile";
import SuperImage from "@/components/SuperImage";
import LoadingScreen from "./LoadingScreen";

function GameScreen() {
	function PlayerSide({
		side,
		user,
	}: {
		side: "left" | "right";
		user: User;
	}) {
		return (
			<div className="h-full py-4">
				<div className="aspect-square h-full overflow-hidden rounded-full">
					<SuperImage
						className="h-full w-full object-cover"
						src={user.avatar}
						alt={user.username}
						width={256}
						height={256}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="relative flex h-32 w-full items-center justify-center gap-8 bg-gradient-to-b from-black/50 pt-8">
				<div className="absolute inset-0 -translate-y-full bg-gradient-to-t from-black/50"></div>
				<PlayerSide side="left" user={user1} />
				<div className="flex aspect-video h-full overflow-hidden rounded-xl">
					<div className="flex flex-1 items-center justify-center bg-card-200 text-3xl text-white">
						1
					</div>
					<div className="flex flex-1 items-center justify-center bg-card-500 text-3xl text-white">
						2
					</div>
				</div>
				<PlayerSide side="right" user={user2} />
			</div>
			<div className="flex w-full items-center justify-center py-4 text-center text-xs text-white">
				<div className="rounded-full bg-card-400 p-2 px-12">
					First to 5
				</div>
			</div>
		</div>
	);
}

const Home = (data: any) => {
	// const [mypoints, setMypoints] = useState(0);
	// const [oppPoints2, setOppPoints] = useState(0);
	const mypoints = data.mypoints;
	const setMypoints = data.setMypoints;

	const oppPoints2 = data.oppPoints2;
	const setOppPoints = data.setOppPoints;
	const setGameStarted = data.setGameStarted;
	const setGameOver = data.setGameOver;
	const [rendered, setRendered] = useState(false);

	const GameDataRef = useRef({
		racket1Ref: null,
		racket1APi: null,
		racket2Ref: null,
		racket2APi: null,
		ballRef: null,
		ballAPi: null,
	});

	const GameData = GameDataRef.current;

	const gameinfo = data.gameinfo;
	const session = data.session;
	const [mTheHost, setMTheHost] = useState(false);

	const Racket_position = useRef([0, 0, 0]);
	const currentpositions = {
		racket1position: [0, 0, 0],
		racket2position: [0, 0, 0],
		ballposition: [0, 0, 0],
		ballvelocity: [0, 0, 0],
		gameId: gameinfo.id,
		opp_id:
			gameinfo.player1_id == session.id
				? gameinfo.player2_id
				: gameinfo.player1_id,
		score: {
			player1: mypoints,
			player2: oppPoints2,
		},
	};

	useEffect(() => {
		if (!rendered) return;
		// sleep(1000);
		console.log("RENDERED", rendered);

		setTimeout(() => {
			socket.emit("playerIsReady", {
				mTheHost: mTheHost,
				gameId: gameinfo.id,
			});
		}, 1000);
		return () => {
			socket.off("playerIsReady");
		};
	}, [rendered]);

	const [startGame, setStartGame] = useState(false);
	const lastTimeSeeASocket = useRef(0);
	const [HostReady, setHostReady] = useState(false);
	const [OppReady, setOppReady] = useState(false);

	useEffect(() => {
		if (!startGame) return;

		const interval = setInterval(() => {
			console.log("lastTimeSeeASocket", lastTimeSeeASocket.current);
			if (lastTimeSeeASocket.current == 0) {
				lastTimeSeeASocket.current = Date.now();
			}

			if (Date.now() - lastTimeSeeASocket.current > 3000) {
				console.log(
					"Player is gone",
					Date.now() - lastTimeSeeASocket.current,
				);
				setMypoints(session.id === gameinfo.player1_id ? 3 : 0);
				setOppPoints(session.id === gameinfo.player1_id ? 0 : 3);
				// if (!mTheHost) {
				// console.log("game type", gameinfo.type);

				socket.emit("game_over", {
					game_id: gameinfo.id,
					player1_id: gameinfo.player1_id,
					player2_id: gameinfo.player2_id,
					mypoints: session.id === gameinfo.player1_id ? 3 : 0,
					oppPoints2: session.id === gameinfo.player1_id ? 0 : 3,
					gameType: gameinfo.game_type,
				});
				// }
				setGameOver(true);
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [startGame, session]);

	useEffect(() => {
		if (!startGame) return;
		if (!GameData.racket1APi || !GameData.racket2APi || !GameData.ballAPi)
			return;
		// console.log("Game Data", GameData);
		// if (GameData.racket1APi?.position == undefined) {
		// 	console.log("Game Data not set");
		// 	return;
		// }
		const interval = setInterval(() => {
			// console.log(GameData);
			GameData.racket1APi.position.subscribe((v) =>
				mTheHost
					? (currentpositions.racket1position = v)
					: (currentpositions.racket2position = v),
			);
			// GameData.racket2APi.position.subscribe((v) =>
			// 	mTheHost
			// 		? (currentpositions.racket2position = v)
			// 		: (currentpositions.racket1position = v),
			// );
			if (mTheHost) {
				currentpositions.score = {
					player1: mypoints,
					player2: oppPoints2,
				};
				// console.log("score ", currentpositions.score);

				GameData.ballAPi.position.subscribe(
					(v) => (currentpositions.ballposition = v),
				);
				GameData.ballAPi.velocity.subscribe(
					(v) => (currentpositions.ballvelocity = v),
				);
			}
			// console.log("Game Data", currentpositions);

			socket.emit("game_data", currentpositions);
		}, 32);

		// return () => clearInterval(interval); // Clean up the interval on component unmount
		return () => {
			clearInterval(interval);
		};
	}, [mypoints, oppPoints2, startGame]);

	// useEffect(() => {
	// 	if (startGame) return;
	// }, [startGame]);

	useEffect(() => {
		if (HostReady && OppReady) {
			setStartGame(true);
			setGameStarted(true);
			socket.emit("start_game", {
				player1Id: gameinfo.player1_id,
				player2Id: gameinfo.player2_id,
			});
		}
	}, [HostReady, OppReady]);

	useEffect(() => {
		socket.connect();
		socket.on("disconnect", () => {});
		socket.on("palyer_ready", (data) => {
			console.log("Player Ready", data);
			// setStartGame(true);
			// setGameStarted(true);
			if (data.mTheHost) {
				setHostReady(true);
			} else {
				setOppReady(true);
			}
		});

		socket.on("recieve_game_data", (data) => {
			if (data.opp_id != session.id) {
				// console.log("recieve_game_data", data.opp_id, session.id);
				return;
			}
			// console.log(data);
			if (!GameData.racket2APi || !GameData.ballAPi) return;
			lastTimeSeeASocket.current = Date.now();

			if (!mTheHost) {
				if (
					data.racket1position &&
					data.racket1position[0] &&
					data.racket1position[1] &&
					data.racket1position[2]
				) {
					GameData.racket2APi.position.set(
						data.racket1position[0] * -1,
						data.racket1position[1],
						data.racket1position[2] * -1,
					);
				}
				if (data.ballposition && data.ballvelocity) {
					GameData.ballAPi.position.set(
						data.ballposition[0] * -1,
						data.ballposition[1],
						data.ballposition[2] * -1,
					);
					GameData.ballAPi.velocity.set(
						data.ballvelocity[0] * -1,
						data.ballvelocity[1],
						data.ballvelocity[2] * -1,
					);
				}
				// console.log("score ", data.score);
				if (data.score.player1 != mypoints) {
					setMypoints(data.score.player1);
				}
				if (data.score.player2 != oppPoints2) {
					setOppPoints(data.score.player2);
				}
			} else {
				// console.log("racket", data.racket2position);
				if (
					data.racket2position &&
					data.racket2position[0] &&
					data.racket2position[1] &&
					data.racket2position[2]
				) {
					GameData.racket2APi.position.set(
						data.racket2position[0] * -1,
						data.racket2position[1],
						data.racket2position[2] * -1,
					);
				}
			}
		});

		return () => {
			socket.off("disconnect");
			socket.off("recieve_game_data");
		};
	}, [mypoints, oppPoints2]);

	if (
		session.id == gameinfo.player1_id &&
		mTheHost == false &&
		gameinfo.player1_id != undefined
	) {
		setMTheHost(true);
		// console.log("I am the host", session.id, gameinfo.player1_id);
	}

	const canvasRef = useRef(null);

	const [refreshCanvas, setRefreshCanvas] = useState(true);
	useEffect(() => {
		if (refreshCanvas == true) {
			setTimeout(() => {
				setRefreshCanvas(false);
			}, 50000);
		} else {
			setTimeout(() => {
				setRefreshCanvas(true);
			}, 1);
		}
	}, [refreshCanvas]);
	const [Timing, setTiming] = useState(0);

	// useEffect(() => {
	// 	console.log(canvasRef.current);
	// }, [canvasRef.current]);

	useEffect(() => {
		if (startGame) {
			GameData.ballAPi.wakeUp();
			GameData.ballAPi.position.set(0, 2.5, 0);
			GameData.ballAPi.velocity.set(0, 0, 3);
			let seconds = 3;
			setTiming(3);
			const interval = setInterval(() => {
				setTiming((prev) => prev - 1);
				seconds--;
				if (seconds <= 0) {
					clearInterval(interval);
				}
			}, 1000);
		} else {
			if (GameData.ballAPi) {
				GameData.ballAPi.position.set(0, 2.5, 0);
				GameData.ballAPi.sleep();
			}
			console.log("Game not started!USEEFFECT");
		}
	}, [startGame]);

	// useEffect(() => {
	// 	if (startGame) return;
	// 	const interval = setInterval(() => {
	// 		socket.emit("playerIsAlive", {
	// 			gameId: gameinfo.id,
	// 			playerId: session.id,
	// 		});
	// 	}, 3000);

	// 	return () => {
	// 		clearInterval(interval);
	// 	};
	// }, [startGame]);

	const [isRotating, setIsRotating] = useState(false);

	const [cameraPosition, setCameraPosition] = useState([0, 2.9, 4.2]);
	const [animationStarted, setAnimationStarted] = useState(true);
	// const mypPoints = useRef(0);
	// const oppPoints = useRef(0);
	// useEffect(() => {
	// 	const handleBeforeUnload = (e) => {
	// 		// Perform actions here, like sending a message to your server
	// 		// e.preventDefault(); // If you want to show a confirmation dialog in some browsers
	// 		// e.returnValue = ''; // Chrome requires returnValue to be set
	// 		socket.emit("playerGone", {
	// 			gameId: gameinfo.id,
	// 			playerId: session.id,
	// 		});
	// 	};

	// 	window.addEventListener("unload", handleBeforeUnload);

	// 	return () => {
	// 		window.removeEventListener("unload", handleBeforeUnload);
	// 	};
	// }, []);
	// useEffect(() => {
	// 	const handlePopState = () => {
	// 		// URL has changed
	// 		socket.emit("playerGone", {
	// 			gameId: gameinfo.id,
	// 			playerId: session.id,
	// 		}); // Perform your actions here
	// 	};

	// 	window.addEventListener("popstate", handlePopState);

	// 	return () => {
	// 		window.removeEventListener("popstate", handlePopState);
	// 	};
	// }, []);

	// useEffect(() => {
	// 	window.addEventListener("beforeunload", alertUser);
	// 	window.addEventListener("unload", handleTabClosing);

	// 	return () => {
	// 		window.removeEventListener("beforeunload", alertUser);
	// 		window.removeEventListener("unload", handleTabClosing);
	// 	};
	// });

	// const handleTabClosing = () => {
	// 	console.log("Tab is closing");
	// };

	// const alertUser = (ev: any) => {
	// 	ev.preventDefault();
	// 	return (ev.returnValue = "Are you sure you want to close?");
	// };

	return (
		// <Controls.Provider>
		// <div className="relative h-full">
		<Suspense
			fallback={
				<LoadingScreen
					user1={mTheHost ? data.player1 : data.player2}
					user2={mTheHost ? data.player2 : data.player1}
				/>
			}
		>
			{/* {!startGame && (
				<StartGameComponent
					startGame={startGame}
					setStartGame={setStartGame}
					HostReady={HostReady}
					setHostReady={setHostReady}
					OppReady={OppReady}
					setOppReady={setOppReady}
					mTheHost={mTheHost}
					gameId={gameinfo.id}
				/>
			)} */}
			{/* {startGame && (
					<PauseGameComponent
						startGame={startGame}
						setStartGame={setStartGame}
					/>
				)} */}
			{/* {Timing != 0 && <TimingComponent Timing={Timing} />} */}
			{/* <StartGameComponent /> */}
			{/* <GameScore myPoints={mypoints} oppPoints={oppPoints2} /> */}
			{/* {rendered && <GameScreen />} */}

			{
				<Canvas
					style={{
						borderRadius: `20px`,
					}}
					ref={canvasRef}
					shadows
					// className={` ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
					camera={{
						near: 0.1,
						far: 1000,
						position: [0, 2.9, 4.2],
						// rotation: [0, 1, 0],
					}}
				>
					{/* {animationStarted && (
							<RoundCamera
								cameraPosition={cameraPosition}
								animationStarted={animationStarted}
								setAnimationStarted={setAnimationStarted}
							/>
						)} */}
					{<CameraController GameData={GameData} />}
					{/* <OrbitControls /> */}
					{session.map == "universe" && (
						<Sky isRotating={isRotating} />
					)}
					<directionalLight
						position={[4, 10, -30]}
						intensity={0.1}
						castShadow
					/>
					<ambientLight intensity={0.5} />
					<pointLight position={[4, 10, -30]} intensity={2} />

					<hemisphereLight intensity={2} />
					<Jball position={[0, 0, 0]} scale={[3, 3, 3]} />
					<Table position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]} />
					<Physics
						iterations={20}
						defaultContactMaterial={{
							restitution: 1.01,
						}}
						gravity={[0, -9.8, 0]}
					>
						<Racket
							GameData={GameData}
							name="racket_mine"
							canvasRef={canvasRef}
							isplayer={true}
							position={[0, 1.8, 3]}
							scale={[1.85, 1.85, 1.85]}
						/>
						<Racket
							GameData={GameData}
							name="racket_opp"
							canvasRef={canvasRef}
							isplayer={false}
							position={[0, 1.8, -3]}
							scale={[1.85, 1.85, 1.85]}
							rotation={[0, Math.PI, 0]}
						/>

						<PlaneTable
							rotation={[-Math.PI / 2, 0, 0]}
							position={[0, 1.66, 0]}
						/>

						{/* {!Timing && ( */}

						<Ball
							mTheHost={mTheHost}
							// position={[0, 3, 0]}
							GameData={GameData}
							animationStarted={animationStarted}
							setAnimationStarted={setAnimationStarted}
							mypoints={mypoints}
							setMypoints={setMypoints}
							oppPoints2={oppPoints2}
							setOppPoints={setOppPoints}
							setRendered={setRendered}
							rendered={rendered}
						/>
					</Physics>
				</Canvas>
			}
		</Suspense>
		// </div>
	);
};

export default Home;
