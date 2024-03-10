"use client";

import PublicContext from "@/contexts/PublicContext";
import { fetcher, fetcherUnsafe } from "@/lib/utils";
import { notFound } from "next/navigation";
import { use, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import socket from "@/lib/socket";
import Game from "@/gameComponents/game";
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
		<div className="z-10 flex h-full w-full justify-center pt-28">
			<div className="h-[80vh] w-[75vw]">
				{ready && game && (
					<>
						<h1 className="mb-4 text-center text-4xl font-bold">
							Game {game.id}
						</h1>
						<div className="flex justify-between">
							<div>
								<h1>Player 1</h1>
								<h1>{game.player1_id}</h1>
							</div>
							<div>
								<h1>Player 2</h1>
								<h1>{game.player2_id}</h1>
							</div>
						</div>
						<Game gameinfo={game} session={session} />
					</>
				)}
				{game && !ready && (
					<>
						<h1>waiting</h1>
						{Object.keys(game).map((key) => (
							<div key={key}>
								{key}: {game[key]}
							</div>
						))}
					</>
				)}
				{!game && <h1>Loading...</h1>}
			</div>
		</div>
	);
}
