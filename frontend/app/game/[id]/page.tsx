"use client";

import PublicContext from "@/contexts/PublicContext";
import { fetcher, fetcherUnsafe } from "@/lib/utils";
import { notFound } from "next/navigation";
import { use, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import socket from "@/lib/socket";
import Game from "@/gameComponents/game";
import { LoadingScreen } from "@/models";
import Card from "@/components/Card";
import { Divide, Gamepad2, Map, Swords, TimerIcon } from "lucide-react";
// import Cube from "@/components";

// import Game from "@/gameComponents/game";

export default function Home({ params }: any) {
	const { session } = useContext(PublicContext) as any;
	const [game, setGame] = useState<any>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const fetchGame = async () => {
			try {
				const res = await fetcher(`/game/match/${params.id}`);
				if (!res) {
					notFound();
					return;
				}
				setGame(res);
			} catch (error) {
				console.error("Error fetching game:", error);
			}
		};

		fetchGame();
	}, [params.id]);

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
			setReady(true);
		});
		return () => {
			socket.off("disconnect");
			socket.off("game-start");
		};
	}, []);

	return (
		<div className="z-10 flex h-full w-full justify-center pt-8">
			<div className="h-[80vh] w-[75vw]">
				{ready && game && (
					<>
						<Card
							className="mb-4 h-12 w-full bg-card-200"
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
								2:00
								<div className="absolute inset-x-[-300px] inset-y-0 -z-10 bg-gradient-to-r from-transparent via-card-500 to-transparent"></div>
							</div>
							<div className="flex gap-2">
								Space
								<Map size={24} />
							</div>
						</Card>
						<Game gameinfo={game} session={session} />
					</>
				)}
				{game && !ready && (
					// <>
					// 	<h1>waiting</h1>
					// 	{Object.keys(game).map((key) => (
					// 		<div key={key}>
					// 			{key}: {game[key]}
					// 		</div>
					// 	))}
					// </>
					<LoadingScreen />
				)}
				{!game && <h1>Loading...</h1>}
			</div>
		</div>
	);
}
