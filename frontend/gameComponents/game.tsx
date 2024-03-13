"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, use, useEffect, useRef, useState, useCallback } from "react";
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
	RoundCamera,
} from "../models";
import { useFrame } from "@react-three/fiber";
import { Controls, useControl } from "react-three-gui";
import { Stats } from "@react-three/drei";

// import { io } from "socket.io-client";
import socket from "@/lib/socket";

// const socket = io("http://localhost:5500");
const GameData = () => {
	const racket1Ref = useRef(null);
	const racket1APi = useRef(null);
	const racket2Ref = useRef(null);
	const racket2APi = useRef(null);
	const ballRef = useRef(null);
	const ballAPi = useRef(null);
};

const currentstatus = () => {
	const racket1position = useRef([0, 0, 0]);
	const racket2position = useRef([0, 0, 0]);
	const ballposition = useRef([0, 0, 0]);
};

// const socket = io("http://localhost:4000");

// import { Physics } from "@react-three/cannon";
import type {
	CylinderArgs,
	CylinderProps,
	PlaneProps,
} from "@react-three/cannon";
import { Debug, Physics, useCylinder, usePlane } from "@react-three/cannon";
import type { Group, Mesh } from "three";
// let animationStarted = true;

const Home = (data: any) => {
	const [mypoints, setMypoints] = useState(0);
	const [oppPoints2, setOppPoints] = useState(0);

	useEffect(() => {
		console.log("useeffect pointss ", mypoints, " vs ", oppPoints2);
	}, [mypoints, oppPoints2]);

	const gameinfo = data.gameinfo;
	const session = data.session;
	// console.log(gameinfo);

	// console.log("gameinfo", session);
	const [mTheHost, setMTheHost] = useState(false);
	// console.log(" host", session.id, gameinfo.player1_id);

	const Racket_position = useRef([0, 0, 0]);
	// const mypoints = useRef(0);
	// const oppPoints = useRef(0);

	// const currentpositions = () => {
	// 	const racket1position = useRef([0, 0, 0]);
	// 	const racket2position = useRef([0, 0, 0]);
	// 	const ballposition = useRef([0, 0, 0]);
	// };
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
			// console.log("racket1 ", currentpositions.racket1position);
			// console.log("racket 2", currentpositions.racket2position);

			socket.emit("game_data", currentpositions);
			// console.log(currentpositions);
		}, 16); // 100 milliseconds = 0.1 seconds

		return () => clearInterval(interval); // Clean up the interval on component unmount
	}, [GameData]);

	useEffect(() => {
		socket.connect();
		socket.on("disconnect", () => {});

		socket.on("recieve_game_data", (data) => {
			if (data.opp_id != session.id) return;
			// console.log(data.racket1position);
			// console.log(data.racket2position);
			// GameData.racket1APi.position.set(data.racket1position);
			// GameData.racket2APi.position.set(data.racket2position);
			// GameData.ballAPi.position.set(data.ballposition);
			// GameData.ballAPi.velocity.set(data.ballvelocity);
			if (!mTheHost) {
				// console.log("recieve_game_data", data.opp_id);
				// GameData	.ballAPi.position.set(data.ballposition);
				// console.log(data.racket2position);
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

	// useEffect(() => {
	// 	socket.connect();
	// 	console.log("connected to server", socket.id);
	// 	// socket.on("start_game", (data) => {
	// 	// 	console.log(data);
	// 	// });

	// 	// socket.emit("join_game", { game: "pong" });

	// 	// socket.emit("join_game", { game: "pong" });
	// });

	// const socketData = useRef(null);
	// useEffect(() => {
	// 	if (socketData.current != null) {
	// 		return null;
	// 	}

	// 	socket.on("connect", () => {
	// 		console.log("Connected to server", socket.id);
	// 	});

	// 	// return () => {
	// 	//   console.log("Disconnecting from server");

	// 	//   socket.disconnect();
	// 	// };
	// }, []);

	const canvasRef = useRef(null);

	const rotationx = useControl("Rotation X", { type: "number" });
	const rotationy = useControl("Rotation Y", { type: "number" });
	const rotationz = useControl("Rotation Z", { type: "number" });
	function Plane(props: PlaneProps) {
		const [ref, api] = usePlane(
			() => ({
				name: "ground",
				...props,
				// onCollide: () => {
				//   console.log("collide table");

				//   // api.position.
				//   // api.velocity.set(0, 1, 0);
				//   //rotation ++
				//   // api.quaternion.set(0, 0, 0, 0);
				// },
			}),
			useRef<Group>(null),
		);

		return (
			<group ref={ref} name="ground">
				<mesh receiveShadow>
					{/* <planeGeometry args={[10, 10]} /> */}
					{/* <meshStandardMaterial color="#ff1f00" /> */}
				</mesh>
			</group>
		);
	}

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

	const [currentStage, setCurrentStage] = useState(1);
	const [isRotating, setIsRotating] = useState(false);

	const adjustIslandForScreenSize = () => {
		let screenScale, screenPosition;
		if (typeof window !== "undefined") {
			// console.log(window.innerWidth);
			screenScale = [1, 1, 1];
			screenPosition = [0, -6.5, -43.4];

			return [screenScale, screenPosition];
		}
	};
	const [startGame, setStartGame] = useState(false);
	const [cinematic, setCinematic] = useState(true);

	// const [islandScale, islandPosition] = adjustIslandForScreenSize();
	const [cameraPosition, setCameraPosition] = useState([0, 2.9, 4.2]);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 2.5 });
	const [animationStarted, setAnimationStarted] = useState(true);
	const mypPoints = useRef(0);
	const oppPoints = useRef(0);

	// const [oppPoints, setOppPoints] = useState(0);

	// useEffect(() => {
	// 	console.log("mypoints", mypoints, mypPoints.current);
	// }, [mypoints, mypPoints.current]);

	const onMouseMove = useCallback((event) => {
		// console.log(Math.random());

		setMousePosition({
			x: (event.clientX / window.innerWidth) * 2 - 1,
			y: -(event.clientY / window.innerHeight) * 2 + 1 + 2.6,
		});
		// console.log(mousePosition);
	}, []);
	const CameraController = () => {
		const { camera } = useThree();
		// console.log("camera controller", camera.position);

		const Racket_position = useRef([0, 0, 0]);
		const updateCameraPosition = () => {
			// console.log(GameData.racket1APi);

			GameData.racket1APi.position.subscribe(
				(v) => (Racket_position.current = v),
			);
			// console.log("Raacket", Racket_position.current);
			if (
				Racket_position.current[0] == 0 &&
				Racket_position.current[1] == 0
			) {
				return null;
			}
			const cameraSensitivity = 0.1;
			camera.position.x = Racket_position.current[0] * 0.7;
			camera.position.y = Racket_position.current[1] + 1;

			camera.lookAt(0, 0, 0);
			// console.log("controller", camera.position);
		};

		useEffect(() => {
			const interval = setInterval(() => {
				updateCameraPosition();
			}, 20); // 100 milliseconds = 0.1 seconds

			return () => clearInterval(interval); // Clean up the interval on component unmount
		}, []); // Empty dependency array means this effect runs once on mount

		// useFrame(() => {
		//   GameData.racket1APi.position.subscribe(
		//     (v) => (Racket_position.current = v)
		//   );
		//   // console.log(Racket_position.current);

		//   // console.log(Racket_position.current);

		//   // GameData.ballAPi.velocity.set(0, 0.1, 0);

		//   // console.log(mousePosition);

		//   // Modify these values to adjust sensitivity or direction
		//   const cameraSensitivity = 0.1;
		//   // camera.position.x +=
		//   //   (mousePosition.x - camera.position.x) * cameraSensitivity;
		//   // camera.position.y +=
		//   //   (mousePosition.y - camera.position.y) * cameraSensitivity * 0.1;
		//   camera.position.x = Racket_position.current[0] * 0.7;
		//   camera.position.y = Racket_position.current[1] + 1;

		//   camera.lookAt(0, 0, 0); // Adjust if you want the camera to look at a different point
		//   // console.log(canvasRef);
		// });

		return null;
	};
	// window.addEventListener("mousemove", (e) => {
	//   // console.log((e.clientX / window.innerWidth) * 2 - 1);

	//   setCameraPosition([
	//     (e.clientX / window.innerWidth) * 2 - 1,
	//     2.5,
	//     (e.clientY / window.innerHeight) * 2 - 1,
	//   ]);
	// });
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
						// onMouseMove={onMouseMove}
					>
						{/* <color attach="background" args={["#171720"]} /> */}

						{/* {animationStarted && (
							<RoundCamera
								cameraPosition={cameraPosition}
								animationStarted={animationStarted}
								setAnimationStarted={setAnimationStarted}
							/>
						)} */}
						{/* <RoundCamera />; */}
						{<CameraController />}
						{/* <OrbitControls /> */}
						<Sky isRotating={isRotating} />
						<directionalLight
							position={[4, 10, -30]}
							intensity={0.1}
							castShadow
						/>
						<ambientLight intensity={0.5} />
						<pointLight position={[4, 10, -30]} intensity={2} />
						{/* <spotLight
          position={[0, 50, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
        /> */}
						<hemisphereLight intensity={2} />
						{/* <Jball position={[0, 0, 0]} scale={[3, 3, 3]} /> */}
						<Table position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]} />
						<Physics
							iterations={20}
							defaultContactMaterial={{
								// contactEquationRelaxation: 1,
								// contactEquationStiffness: 1e7,
								// friction: 0.2,
								// frictionEquationRelaxation: 2,
								// frictionEquationStiffness: 1e7,
								restitution: 1.01,
							}}
							gravity={[0, -9.8, 0]}
							// allowSleep={false}
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
							{/* <Island
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
          /> */}
							{/* <Plane
            rotation={[-Math.PI / 2, 0, 0]}
            userData={{ id: "floor" }}
            position={[0, 1.5, 0]}
          /> */}
							<Plane
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
								mypPoints={mypPoints}
								oppPoints={oppPoints}
								oppPoints2={oppPoints2}
								setOppPoints={setOppPoints}
							/>
						</Physics>
						{/* <TextGeo /> */}
						{/* <Stats /> */}
					</Canvas>
				)}
			</Suspense>
		</div>
	);
};

export default Home;
