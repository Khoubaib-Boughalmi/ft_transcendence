"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import React from "react";
import {
	Sky,
	Racket,
	Ball,
	Jball,
	Table,
	CameraController,
	PlaneTable,
	Sky_cloud,
} from "../models";

import socket from "@/lib/socket";

import { Physics } from "@react-three/cannon";
import LoadingScreen from "./LoadingScreen";

const Home = (data: any) => {
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
		const interval = setInterval(() => {
			GameData.racket1APi.position.subscribe((v) =>
				mTheHost
					? (currentpositions.racket1position = v)
					: (currentpositions.racket2position = v),
			);
			if (mTheHost) {
				currentpositions.score = {
					player1: mypoints,
					player2: oppPoints2,
				};

				GameData.ballAPi.position.subscribe(
					(v) => (currentpositions.ballposition = v),
				);
				GameData.ballAPi.velocity.subscribe(
					(v) => (currentpositions.ballvelocity = v),
				);
			}
			socket.emit("game_data", currentpositions);
		}, 32);

		return () => {
			clearInterval(interval);
		};
	}, [mypoints, oppPoints2, startGame]);

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
			if (data.mTheHost) {
				setHostReady(true);
			} else {
				setOppReady(true);
			}
		});

		socket.on("recieve_game_data", (data) => {
			if (data.opp_id != session.id) {
				return;
			}
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
				if (data.score.player1 != mypoints) {
					setMypoints(data.score.player1);
				}
				if (data.score.player2 != oppPoints2) {
					setOppPoints(data.score.player2);
				}
			} else {
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
		!mTheHost &&
		gameinfo.player1_id != undefined
	) {
		setMTheHost(true);
	}

	const canvasRef = useRef(null);

	useEffect(() => {
		if (startGame) {
			GameData.ballAPi.wakeUp();
			GameData.ballAPi.position.set(0, 2.5, 0);
			GameData.ballAPi.velocity.set(0, 0, 3);
		} else {
			if (GameData.ballAPi) {
				GameData.ballAPi.position.set(0, 2.5, 0);
				GameData.ballAPi.sleep();
			}
			console.log("Game not started!USEEFFECT");
		}
	}, [startGame]);

	const [animationStarted, setAnimationStarted] = useState(true);

	return (
		<Suspense
			fallback={
				<LoadingScreen
					user1={mTheHost ? data.player1 : data.player2}
					user2={mTheHost ? data.player2 : data.player1}
				/>
			}
		>
			{
				<Canvas
					style={{
						borderRadius: `20px`,
					}}
					ref={canvasRef}
					shadows
					camera={{
						near: 0.1,
						far: 1000,
						position: [0, 2.9, 4.2],
					}}
				>
					{<CameraController GameData={GameData} />}
					{session.map == "universe" && <Sky />}
					{session.map == "cloud" && <Sky_cloud />}
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

						<Ball
							mTheHost={mTheHost}
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
	);
};

export default Home;
