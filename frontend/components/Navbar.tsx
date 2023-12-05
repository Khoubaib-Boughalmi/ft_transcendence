"use client";

import { LogIn, Search, UserCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";

const buttons = ["Home", "Leaderboard", "Play"] as const;

function Navigation() {
	const [active, setActive] = useState(buttons[0]) as [
		(typeof buttons)[number],
		(button: (typeof buttons)[number]) => void,
	];

	return (
		<>
			{buttons.map((button, i) => (
				<Button
					variant={button === active ? "default" : "transparent"}
					key={button}
					onClick={() => setActive(button)}
				>
					{button}
				</Button>
			))}
		</>
	);
}

function LoginButton() {
	return (
		<Button
			as="a"
			href="https://www.google.com"
			startContent={<img className="h-5 w-5 invert" src="42_Logo.svg" />}
			variant="ghost"
		>
			Sign in
		</Button>
	);
}

function SearchBar() {
	return (
		<div className="flex h-full w-full items-center justify-center gap-2 rounded-3xl bg-white/10 px-4 pl-2 text-sm text-white shadow transition-all duration-300 file:h-full focus-within:ring-2 focus-within:ring-primary-400 hover:brightness-110 active:scale-95">
			<Search className="h-2/4 text-white/50" />
			<input
				className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
				placeholder="Search"
			/>
		</div>
	);
}

export function Navbar() {
	const [solid, setSolid] = useState(false);

	useEffect(() => {
		const listener = () => {
			setSolid(window.scrollY > 25);
		};
		window.addEventListener("scroll", listener);
		return () => window.removeEventListener("scroll", listener);
	}, []);

	return (
		<nav
			data-solid={solid}
			className="fixed top-0 z-50 flex h-28 w-full items-center justify-center px-8
				data-[solid=true]:px-0
				data-[solid=true]:h-16 transition-all
				ease-in-out
				duration-300
				">
			<div
				data-solid={solid}
				className="flex w-3/4 rounded-full bg-black/50 shadow-lg shadow-card/25 transition-all items-center justify-center
				data-[solid=true]:bg-black data-[solid=true]:bg-opacity-100 data-[solid=true]:backdrop-blur-sm data-[solid=true]:w-full data-[solid=true]:h-full data-[solid=true]:rounded-none
				data-[solid=true]:px-8
				ease-in-out
				duration-300
				"
			>
				<div className="m-2 flex h-9 w-full items-center justify-between gap-2">
					<div className="flex h-full flex-1 items-center justify-start gap-2">
						<SearchBar />
					</div>
					<div className="flex h-full flex-1 items-center justify-center gap-2">
						<Navigation />
					</div>
					<div className="flex h-full flex-1 items-center justify-end gap-2">
						<LoginButton />
					</div>
				</div>
			</div>
		</nav>
	);
}
