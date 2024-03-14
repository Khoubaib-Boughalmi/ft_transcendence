"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import React from "react";
import { OrbitControls, PositionPoint } from "@react-three/drei";
import {
	Island,
	Sky,
	Racket,
	Ball,
	Jball,
	Table,
	TextGeo,
	FallbackComponent,
	StartGame,
	GameScore,
	CameraController,
	RoundCamera,
	PlaneTable,
} from "../models";
import { useFrame } from "@react-three/fiber";
import { Controls, useControl } from "react-three-gui";
import { Stats } from "@react-three/drei";

import socket from "@/lib/socket";

const GameData = () => {
	const racket1Ref = useRef(null);
	const racket1APi = useRef(null);
	const racket2Ref = useRef(null);
	const racket2APi = useRef(null);
	const ballRef = useRef(null);
	const ballAPi = useRef(null);
};

import { Debug, Physics, useCylinder, usePlane } from "@react-three/cannon";
import type { Group, Mesh } from "three";

const Home = (data: any) => {
	const [mypoints, setMypoints] = useState(0);
	const [oppPoints2, setOppPoints] = useState(0);

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
	};

	useEffect(() => {
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
				GameData.ballAPi.position.subscribe(
					(v) => (currentpositions.ballposition = v),
				);
				GameData.ballAPi.velocity.subscribe(
					(v) => (currentpositions.ballvelocity = v),
				);
			}

			socket.emit("game_data", currentpositions);
		}, 16);

		return () => clearInterval(interval); // Clean up the interval on component unmount
	}, [GameData]);

	useEffect(() => {
		socket.connect();
		socket.on("disconnect", () => {});

		socket.on("recieve_game_data", (data) => {
			if (data.opp_id != session.id) return;
			if (!mTheHost) {
				GameData.racket2APi.position.set(
					data.racket1position[0] * -1,
					data.racket1position[1],
					data.racket1position[2] * -1,
				);
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
			} else {
				GameData.racket2APi.position.set(
					data.racket2position[0] * -1,
					data.racket2position[1],
					data.racket2position[2] * -1,
				);
			}
		});

		return () => {
			socket.off("disconnect");
			socket.off("recieve_game_data");
		};
	});

	if (
		session.id == gameinfo.player1_id &&
		mTheHost == false &&
		gameinfo.player1_id != undefined
	) {
		setMTheHost(true);
		console.log("I am the host", session.id, gameinfo.player1_id);
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

	const [isRotating, setIsRotating] = useState(false);

	const [startGame, setStartGame] = useState(false);

	const [cameraPosition, setCameraPosition] = useState([0, 2.9, 4.2]);
	const [animationStarted, setAnimationStarted] = useState(true);
	// const mypPoints = useRef(0);
	// const oppPoints = useRef(0);

	return (
		// <Controls.Provider>
		<div className="relative h-full">
			<Suspense fallback={<FallbackComponent /> /* or null */}>
				{/* <StartGame /> */}
				<GameScore myPoints={mypoints} oppPoints={oppPoints2} />
				{refreshCanvas && (
					<Canvas
						style={{
							borderRadius: `20px`,
						}}
						ref={canvasRef}
						shadows
						className={` ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
						camera={{
							near: 0.1,
							far: 1000,
							position: cameraPosition,
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
						<Sky isRotating={isRotating} />
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
								position={[0, 3, 0]}
								GameData={GameData}
								animationStarted={animationStarted}
								setAnimationStarted={setAnimationStarted}
								mypoints={mypoints}
								setMypoints={setMypoints}
								oppPoints2={oppPoints2}
								setOppPoints={setOppPoints}
							/>
						</Physics>
					</Canvas>
				)}
			</Suspense>
		</div>
	);
};

export default Home;
