"use client";

import { LogIn, Search, UserCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useEffect, useState, useContext } from "react";
import PublicContext from "@/contexts/PublicContext";
import Status from "@/components/Status";
import Input from "@/components/Input";
import { User } from "@/types/profile";
import { Skeleton } from "@nextui-org/react";
import { SuperSkeleton } from "./SuperSkeleton";

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
			href="http://localhost:3000/api/auth/intra/login"
			startContent={<img className="h-5 w-5 invert" src="42_Logo.svg" />}
			variant="ghost"
		>
			Sign in
		</Button>
	);
}

function ProfileButton({ user }: { user: User }) {
	return (
		<div className="flex h-full items-center gap-2 text-xs text-white">
			<div className="flex flex-col items-end">
				{user.username}
				<Status status="Online" />
			</div>
			<div className="aspect-square h-full ">
				<img
					src="pfp.png"
					className="h-full w-full rounded-full object-cover"
				/>
			</div>
		</div>
	);
}

function SearchBar() {
	return (
		<Input
			startContent={<Search className="text-background-800" />}
			placeholder="Search"
		/>
	);
}

export function Navbar() {
	const [solid, setSolid] = useState(false);
	const { cookie, session, sessionLoading } = useContext(
		PublicContext,
	) as any;

	useEffect(() => {
		const listener = () => {
			setSolid(window.scrollY > 25);
		};
		window.addEventListener("scroll", listener);
		listener();
		return () => window.removeEventListener("scroll", listener);
	}, []);

	console.log(sessionLoading);

	return (
		<nav
			data-solid={solid}
			className="fixed top-0 z-50 flex h-28 w-full items-center justify-center px-8
				transition-all
				duration-300 ease-in-out
				data-[solid=true]:h-16
				data-[solid=true]:px-0
				"
		>
			<div
				data-solid={solid}
				className="shadow-card/25 flex w-3/4 items-center justify-center rounded-full bg-black/50 shadow-lg transition-all
				duration-300 ease-in-out data-[solid=true]:h-full data-[solid=true]:w-full data-[solid=true]:rounded-none data-[solid=true]:bg-black
				data-[solid=true]:bg-opacity-100
				data-[solid=true]:px-8
				data-[solid=true]:backdrop-blur-sm
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
						<div className="relative h-full max-w-full">
							<SuperSkeleton
								isLoaded={!sessionLoading}
								className="absolute inset-y-0 right-0 z-10 w-36 rounded-full "
							/>
							{cookie ? (
								<ProfileButton user={session} />
							) : (
								<LoginButton />
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
