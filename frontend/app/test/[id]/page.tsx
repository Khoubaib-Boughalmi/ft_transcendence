"use client";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import SuperImage from "@/components/SuperImage";
import PublicContext from "@/contexts/PublicContext";
import axios from "@/lib/axios";
import socket from "@/lib/socket";
import {
	fetcher,
	getFlag,
	getRandomChallengeMessage,
	getRank,
} from "@/lib/utils";
// import { user1, user2 } from "@/mocks/profile";
import { User } from "@/types/profile";
import { AnimatePresence, motion } from "framer-motion";
import {
	Divide,
	Gamepad2,
	Home,
	Map,
	Swords,
	TimerIcon,
	Undo2,
} from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { use, useContext, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function GameScreen({
	user1,
	user2,
	game,
	session,
	mypoints,
	setMypoints,
	oppPoints2,
	setOppPoints,
	setGameStarted,
	gameover,
	setGameOver,
	router,
}) {
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
		<div className="relative h-full w-full">
			<div className="absolute inset-0 z-10 flex flex-col-reverse">
				{gameover && (
					<div className="absolute  top-0 z-10 p-8">
						<Button
							onClick={() => {
								router.push(`/`);
							}}
							startContent={<Undo2 size={18} />}
						>
							Home
						</Button>
					</div>
				)}
				<div className="relative flex h-32 w-full items-center justify-center gap-8 bg-gradient-to-t from-black/50 pb-8">
					<div className="absolute inset-0 translate-y-full bg-gradient-to-b from-black/50"></div>
					<PlayerSide side="left" user={user1} />
					<div className="flex aspect-video h-full overflow-hidden rounded-xl">
						<div className="flex flex-1 items-center justify-center bg-card-200 text-3xl text-white">
							{mypoints}
						</div>
						<div className="flex flex-1 items-center justify-center bg-card-500 text-3xl text-white">
							{oppPoints2}
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
			{!gameover && (
				<div className="h-full w-full">
					<Game
						gameinfo={game}
						session={session}
						mypoints={mypoints}
						setMypoints={setMypoints}
						oppPoints2={oppPoints2}
						setOppPoints={setOppPoints}
						setGameStarted={setGameStarted}
						player1={user1}
						player2={user2}
						setGameOver={setGameOver}
					/>
				</div>
			)}
			{gameover && (
				<motion.div
					key="gameover"
					initial={{ opacity: 0, translateY: "100%" }}
					animate={{ opacity: 1, translateY: "0%" }}
					exit={{ opacity: 0, translateY: "-100%" }}
					className="h-full w-full"
				>
					<div className="flex h-full w-full flex-col items-center justify-center">
						<div className="flex items-center justify-center gap-4 text-6xl text-white">
							Game Over
						</div>
						<div className="flex items-center justify-center gap-4 text-5xl">
							{game.player1_id != session.id &&
							game.player2_id != session.id
								? "Hi"
								: (game.player1_id == session.id &&
											mypoints > oppPoints2) ||
									  (game.player1_id != session.id &&
											oppPoints2 > mypoints)
									? "You Win"
									: mypoints === oppPoints2
										? "Draw"
										: "You Lose"}
						</div>
					</div>
				</motion.div>
			)}
		</div>
	);
}

import { dummyUser } from "@/mocks/profile";
import Game from "@/gameComponents/game";
import LoadingScreen from "@/gameComponents/LoadingScreen";
import { log } from "console";
import { Button } from "@/components/Button";
// import gameSocket from "@/lib/gamesocket";

export default function Page({ params }) {
	const router = useRouter();

	const [mypoints, setMypoints] = useState(0);
	const [oppPoints2, setOppPoints] = useState(0);
	const { session } = useContext(PublicContext) as any;
	const [game, setGame] = useState<any>(null);
	const [ready, setReady] = useState(false);
	const [player1, setPlayer1] = useState<User>(dummyUser);
	const [user2, setUser2] = useState<User>(dummyUser);
	const [timing, setTiming] = useState(90);
	const [gamestarted, setGameStarted] = useState(false);
	const [gameover, setGameOver] = useState(false);
	const [queueAnnounced, setQueueAnnounced] = useState(false);

	useEffect(() => {
		if (!gamestarted) return;
		const interval = setInterval(() => {
			if (gameover) return;
			setTiming((prev) => prev - 1);
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [gamestarted, gameover]);

	useEffect(() => {
		if (gameover) return;

		if (timing <= 0 || mypoints >= 5 || oppPoints2 >= 5) {
			setGameOver(true);

			console.log("Game Over", {
				gameId: game.id,
				opp_id:
					game.player1_id == session.id
						? game.player2_id
						: game.player1_id,
				score: { player1: mypoints, player2: oppPoints2 },
			});
			socket.emit("game_data", {
				gameId: game.id,
				opp_id:
					game.player1_id == session.id
						? game.player2_id
						: game.player1_id,
				score: { player1: mypoints, player2: oppPoints2 },
			});
			if (game.player1_id == session.id) {
				socket.emit("game_over", {
					game_id: game.id,
					player1_id: game.player1_id,
					player2_id: game.player2_id,
					mypoints,
					oppPoints2,
				});
			}
		}
	}, [timing, mypoints, oppPoints2, session]);

	useEffect(() => {
		const fetchGame = async () => {
			try {
				const res = await fetcher(`/game/match/${params.id}`);
				if (!res) {
					notFound();
					return;
				}

				setPlayer1((res as any).player1info);
				if ((res as any).player2_id != "-1")
					setUser2((res as any).player2info);
				if ((res as any).game_ended) {
					setTiming(0);
					setGameOver(true);
					setReady(true);

					// game.player1_id == session.id
					// 	? setMypoints((res as any).player1_score)
					// 	: setMypoints((res as any).player2_score);
					// setOppPoints((res as any).player2_score);
					// setOppPoints((res as any).player1_score);
					if ((res as any).player1info == session.id) {
						setMypoints((res as any).player1_score);
						setOppPoints((res as any).player2_score);
					} else {
						setMypoints((res as any).player2_score);
						setOppPoints((res as any).player1_score);
					}
				}
				console.log("game", res);
				setGame(res);
			} catch (error) {
				console.error("Error fetching game:", error);
			}
		};

		fetchGame();
	}, [params.id, queueAnnounced]);

	useEffect(() => {
		if (!game) return;
		if (session.id == 1) return;
		const me = session.id;
		if (game.player1_id == me || game.player2_id == me) {
			console.log("Join game");
			const res = axios.post("/game/joingame", {
				match_id: game.id,
				player_id: me,
				socket_id: socket.id,
				player1or2: game.player1_id == me ? 1 : 2,
			});
		}
	}, [game, session]);

	useEffect(() => {
		socket.connect();
		console.log("socket", socket.id);

		socket.on("disconnect", () => {});
		socket.on("game-start", (key) => {
			if (game.player2_id == "-1") setQueueAnnounced(true);
			setReady(true);
		});
		socket.on("announceWaitingPlayer", (key) => {
			console.log("CHI 7AJA JAT");
		});
		return () => {
			socket.off("disconnect");
			socket.off("game-start");
			socket.off("announceWaitingPlayer");
		};
	}, [game]);

	const [tab, setTab] = useState("loading");
	// const tabs = [
	// 	["loading", <LoadingScreen user1={player1} user2={user2} />],
	// 	[
	// 		"game",
	// 		<GameScreen
	// 			user1={player1}
	// 			user2={user2}
	// 			game={game}
	// 			session={session}
	// 		/>,
	// 	],
	// ] as any;

	// useEffect(() => {
	// 	gameSocket.connect();

	// 	return () => {
	// 		gameSocket.disconnect();
	// 	};
	// }, []);

	// console.log("rendering", tab);

	function formatTime(seconds: number): string {
		let minutes: number = Math.floor(seconds / 60);
		let remainingSeconds: number = seconds % 60;

		// Add leading zeros if needed
		let minutesStr: string = String(minutes).padStart(2, "0");
		let secondsStr: string = String(remainingSeconds).padStart(2, "0");

		return `${minutesStr}:${secondsStr}`;
	}

	return (
		<div className="absolute inset-0 flex items-center justify-center overflow-hidden">
			<motion.div
				initial={{ opacity: 0, translateY: "100%" }}
				animate={{ opacity: 1, translateY: "0%" }}
				onClick={() => {
					setTab((prev) => (prev == "loading" ? "game" : "loading"));
				}}
				className="flex flex-col items-center justify-center gap-4 py-0"
			>
				<Card
					className="h-12 w-full bg-card-200"
					classNames={{
						innerContainer:
							"flex items-center justify-between px-4 py-0",
					}}
				>
					<div className="flex gap-2">
						<Gamepad2 size={24} />
						Casual
					</div>
					<div className="relative flex h-full items-center gap-2 text-lg font-bold text-foreground-700">
						<TimerIcon size={24} />
						{formatTime(timing)}
						<div className="absolute inset-x-[-300px] inset-y-0 -z-10 bg-gradient-to-r from-transparent via-card-500 to-transparent"></div>
					</div>
					<div className="flex gap-2">
						Space
						<Map size={24} />
					</div>
				</Card>
				<Card
					className="aspect-video h-[80vh] overflow-hidden"
					classNames={{
						innerContainer: "p-0",
					}}
				>
					<AnimatePresence mode="popLayout">
						<div className="h-full w-full select-none overflow-hidden rounded-3xl">
							{!ready || !game ? (
								<motion.div
									key="loading"
									initial={{ opacity: 0, translateY: "100%" }}
									animate={{ opacity: 1, translateY: "0%" }}
									exit={{ opacity: 0, translateY: "-100%" }}
									className="h-full w-full"
								>
									<LoadingScreen
										user1={player1}
										user2={user2}
									/>
								</motion.div>
							) : (
								<motion.div
									key="game"
									initial={{ opacity: 0, translateY: "100%" }}
									animate={{ opacity: 1, translateY: "0%" }}
									exit={{ opacity: 0, translateY: "-100%" }}
									className="h-full w-full"
								>
									<GameScreen
										user1={player1}
										user2={user2}
										game={game}
										session={session}
										mypoints={mypoints}
										setMypoints={setMypoints}
										oppPoints2={oppPoints2}
										setOppPoints={setOppPoints}
										setGameStarted={setGameStarted}
										gameover={gameover}
										setGameOver={setGameOver}
										router={router}
									/>
								</motion.div>
							)}
						</div>
					</AnimatePresence>
				</Card>
			</motion.div>
		</div>
	);
}
