"use client";
import { Button } from "@/components/Button";
import { UserPlus2, UserX2 } from "lucide-react";
import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react";
import Divider from "@/components/Divider";

function LevelBar() {
	return (
		<div className="flex h-2 w-full items-center gap-8">
			<div className="h-2 flex-1 overflow-hidden rounded-3xl bg-black ">
				<div className="h-full w-1/2 bg-gradient-to-r from-card via-accent to-primary"></div>
			</div>
			<div className="flex aspect-square  h-[750%] -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-accent to-card text-2xl font-bold leading-6 text-white ring-2  ring-card">
				34
			</div>
		</div>
	);
}

function PageTop() {
	return (
		<div className="relative w-full">
			<div className="relative h-96 w-full">
				<img
					src="background2.png"
					className="h-full w-full object-cover"
				/>
				<div className="scale-y-200 absolute inset-0 translate-y-1/2 bg-gradient-to-t from-transparent via-black/0 to-transparent"></div>
				<div className="absolute inset-0 z-10 flex items-end justify-end gap-2 p-8">
					<Button startContent={<UserPlus2 />} variant="secondary">
						Add Friend
					</Button>
					<Button startContent={<UserX2 />} variant="danger">
						Block User
					</Button>
				</div>

				<div></div>
				{/* <div className="absolute inset-0 flex translate-y-1/2 items-center gap-8 px-16 ">
					<div className="flex h-48 w-full gap-4">
						<div className="aspect-square h-full flex-shrink-0 rounded-full">
							<img
								className="rounded-full object-cover"
								src="/pfp.png"
							/>
						</div>
						<div className="flex w-full flex-col items-start justify-start text-white">
							<div className="text-xl font-bold">mcharrad</div>
							<div className="mb-2 flex items-center gap-2 rounded-3xl bg-white/20 px-2 text-sm">
								<div className="aspect-square h-2 w-2 rounded-full bg-green-400"></div>
								<div>Online</div>
							</div>
							<div className="flex gap-2 text-sm">
								<span className="font-flag">🇲🇦</span>
								<span>Morocco</span>
							</div>
						</div>
					</div>
				</div> */}
			</div>
			<div className=" w-full overflow-hidden rounded-b-3xl bg-card-300">
				<div className="aspect-square h-full flex-shrink-0 rounded-full ">
					<img
						className="z-30 -translate-y-1/2 rounded-full object-cover"
						src="/pfp.png"
					/>
				</div>
				{/* <div className="h-32 w-full bg-card flex">
					{[
						["Global Rank", "1,234"],
						["Country Rank", "123"],
						["Points", "1,234"],
					].map(([title, value]) => (
						<InfoCard key={title} title={title}>{value}</InfoCard>
					))}
				</div> */}
			</div>
		</div>
	);
}

function InfoCard({ title, children }: { title: string; children: any }) {
	return (
		<div className="flex flex-1 flex-col gap-4  p-8 text-white">
			<div className="flex items-center text-xl font-bold">{title}</div>
			<div className="text-md flex items-center font-medium">
				{children}
			</div>
		</div>
	);
}

function no() {
	return (
		<main className="flex w-[1250px] max-w-full justify-center">
			<div className="h-[300vh] w-full rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent from-[-100%] to-transparent shadow-lg shadow-card/25 backdrop-blur-sm">
				<div className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl">
					<PageTop />
					{/* <div className="flex w-full gap-4 rounded-3xl bg-gradient-to-b from-card-300 to-background p-4">
						{[
							["Global Rank", "1,234"],
							["Country Rank", "123"],
							["Points", "1,234"],
							["Friends", "123"],
						].map(([title, value]) => (
							<InfoCard title={title}>{value}</InfoCard>
						))}
					</div> */}
				</div>
			</div>
		</main>
	);
}

function TabButton({ title }: { title: string }) {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-b from-card-300 to-background p-4">
			{title}
		</div>
	);
}

function Card({
	header,
	children,
	footer,
	color = "bg-card-300",
}: {
	header?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	color?: string;
}) {
	return (
		<div className={`flex flex-col rounded-3xl ${color}`}>
			{header && (
				<>
					<div className="flex flex-shrink-0 p-4 text-white font-medium ">
						{header}
					</div>
					<Divider />
				</>
			)}

			<div className="flex-1 p-6 text-background-800">{children}</div>

			{footer && (
				<>
					<Divider />
					<div className="flex flex-shrink-0 p-4 text-white">
						{footer}
					</div>
				</>
			)}
		</div>
	);
}

export default function Home() {
	const [tab, setTab] = useState("Overview");
	const [extended, setExtended] = useState(false);
	const tabNavRef = useRef(null) as any;
	const originalTabNavTop = useRef(-1) as any;

	useEffect(() => {
		if (originalTabNavTop.current === -1) {
			originalTabNavTop.current =
				tabNavRef.current.offsetTop - tabNavRef.current.offsetHeight;
		}
		const handleScroll = () => {
			if (window.scrollY > originalTabNavTop.current) {
				setExtended(true);
			} else {
				setExtended(false);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [tabNavRef.current]);

	return (
		<main className="flex w-[1250px] max-w-full flex-col justify-center gap-4">
			<div className="flex w-full flex-col">
				<div className="relative h-96 w-full overflow-hidden rounded-t-3xl">
					<img
						src="background2.png"
						className="h-full w-full object-cover"
					/>
					<div className="absolute inset-0 z-10 flex items-end justify-end gap-2 p-8">
						<Button
							startContent={<UserPlus2 />}
							variant="secondary"
						>
							Add Friend
						</Button>
						<Button startContent={<UserX2 />} variant="danger">
							Block User
						</Button>
					</div>
					<div className="absolute inset-0 bg-gradient-to-t from-card-300"></div>
				</div>
				<div className="z-10 flex h-24 w-full rounded-b-3xl bg-card-300 px-8">
					<div className="aspect-square h-[150%]">
						<img
							className="-translate-y-1/2 rounded-full object-cover"
							src="/pfp.png"
						/>
					</div>
					<div className="relative flex w-full translate-y-[-25%] flex-col items-start gap-4 px-2 pl-4 text-white">
						<div className="flex items-center gap-1 rounded-3xl bg-green-600 px-1 text-[0.65rem]">
							<div className="aspect-square h-2 w-2 rounded-full bg-green-400"></div>
							<div>Online</div>
						</div>
						<div className="flex w-full flex-col gap-1">
							<div className="text-2xl font-bold leading-5">
								mcharrad
							</div>
							<div className="flex gap-2 text-xs leading-[0.5rem]">
								<span className="font-flag">🇲🇦</span>
								<span>Morocco</span>
							</div>
						</div>
						<LevelBar />
					</div>
				</div>
			</div>
			<div
				ref={tabNavRef}
				data-extended={extended}
				className="sticky top-8 z-30 flex w-full items-center justify-center gap-2 rounded-3xl bg-card p-2 transition-all duration-300 data-[extended=true]:translate-y-full"
			>
				{["Overview", "Friends", "Achievements", "Stats"].map(
					(title) => (
						<Button
							key={title}
							variant={
								tab === title ? "secondary" : "transparent"
							}
							onClick={() => setTab(title)}
						>
							{title}
						</Button>
					),
				)}
			</div>
			<Card color="bg-card-300" header={"Overview"}>
				fuck
			</Card>
			<div className="flex h-[200vh] gap-2 rounded-3xl bg-card-300 p-2"></div>
		</main>
	);
}
