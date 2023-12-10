"use client";
import { Button } from "@/components/Button";
import { Equal, Expand, Medal, UserPlus2, UserX2, X } from "lucide-react";
import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react";
import Divider from "@/components/Divider";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@nextui-org/react";
import Status from "@/components/Status";
import Chart from "@/components/Chart";

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

function AchievementScore(
	{ size }: { size?: "sm" | "md" | "lg" } = { size: "md" },

) {
	return (
		<div
		data-size={size}	
		className="flex gap-1 text-white data-[size=sm]:text-xs group justify-start items-center data-[size=sm]:gap-0">
			<Medal className="p-0.5 group-data-[size=sm]:p-1.5"/>
			537
		</div>
	)
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
			</div>
			<div className=" w-full overflow-hidden rounded-b-3xl bg-card-300">
				<div className="aspect-square h-full flex-shrink-0 rounded-full ">
					<img
						className="z-30 -translate-y-1/2 rounded-full object-cover"
						src="/pfp.png"
					/>
				</div>
			</div>
		</div>
	);
}

function ModalSet({
	children,
	trigger,
	title,
	isOpen,
	onOpenChange,
	onClose,
}: {
	children?: ReactNode;
	trigger?: ReactNode;
	title?: ReactNode;
	isOpen: boolean;
	onOpenChange: ComponentProps<typeof Modal>["onOpenChange"];
	onClose: ComponentProps<typeof Modal>["onClose"];
}) {
	return (
		<>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				scrollBehavior="outside"
				hideCloseButton
				placement="center"
				size="4xl"
			>
				<ModalContent className="bg-transparent shadow-none">
					<Card
						header={
							<div className="flex w-full items-center justify-between">
								{title}
								<div className="ml-auto">
									<Button
										iconOnly
										startContent={<X />}
										variant="danger"
										onClick={onClose}
									></Button>
								</div>
							</div>
						}
						fullWidth
					>
						{children}
					</Card>
				</ModalContent>
			</Modal>
			{trigger}
		</>
	);
}

function Card({
	header,
	children,
	footer,
	color = "bg-card-300",
	fullWidth = false,
}: {
	header?: ReactNode;
	children?: ReactNode;
	footer?: ReactNode;
	color?: string;
	fullWidth?: boolean;
}) {
	return (
		<div
			data-full-width={fullWidth}
			className={`flex flex-col rounded-3xl ${color} z-10 data-[full-width=true]:w-full`}
		>
			{header && (
				<>
					<div className="flex flex-shrink-0 p-4 font-medium text-white ">
						{header}
					</div>
					<Divider />
				</>
			)}

			<div className="flex-1 p-2 text-background-800">{children}</div>

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

function MatchHistoryEntry({
	user1,
	user2,
	result,
}: {
	user1: string;
	user2: string;
	result: "win" | "lose" | "tie";
}) {
	const PlayerSide = ({
		user,
		side,
	}: {
		user: any;
		side: "left" | "right";
	}) => {
		const { name, country, icon } = user;

		return (
			<div className="relative flex flex-1 gap-2 overflow-hidden p-2">
				<img
					src={icon}
					className="absolute inset-0 h-full w-full scale-150 object-cover blur-sm brightness-50"
				/>
				<div
					data-side={side}
					className="z-10 flex w-full items-center gap-4 text-white data-[side=right]:flex-row-reverse"
				>
					<div className="aspect-square h-full overflow-hidden rounded-full">
						<img src={icon} className="h-full w-full" />
					</div>
					<div
						data-side={side}
						className="flex flex-col  items-start gap-0.5 data-[side=right]:items-end"
					>
						<span className="text-lg font-medium leading-4">
							{name}
						</span>
						<span
							data-side={side}
							className="flex items-center justify-center gap-1 text-[0.65rem] leading-3 text-background-900 data-[side=right]:flex-row-reverse"
						>
							<span className="font-flag">
								{country.split(" ")[0]}
							</span>
							<span>{country.split(" ").slice(1).join(" ")}</span>
						</span>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="relative flex h-16 w-full  overflow-hidden rounded-3xl bg-black brightness-90 transition-all @container hover:scale-105 hover:brightness-110">
			<PlayerSide
				user={{
					name: "mcharrad",
					icon: "/pfp.png",
					country: "🇨🇳 Xina",
				}}
				side={"left"}
			/>
			<PlayerSide
				user={{
					name: "mrian",
					icon: "mrian.jpeg",
					country: "🇲🇦 Morocco",
				}}
				side={"right"}
			/>
			<div
				data-result={result}
				className="absolute inset-0 flex items-center justify-center  gap-4 bg-gradient-to-r from-transparent via-green-500 to-transparent p-4 text-white data-[result=lose]:via-red-600 data-[result=tie]:via-yellow-400"
			>
				<div className="flex flex-col items-end">
					<span className="text-xs font-medium">Duration</span>
					<span className="text-[0.6rem]">5:00</span>
				</div>
				<Divider orientation="vertical" />
				<span className="flex aspect-square h-full items-center justify-center">
					5
				</span>
				<div className=" flex aspect-square items-center justify-center rounded-full bg-white/25 p-2">
					{result == "win" ? (
						<Medal size={28} />
					) : result == "lose" ? (
						<X size={28} />
					) : (
						<Equal size={28} />
					)}
				</div>
				<span className="flex aspect-square h-full items-center justify-center">
					0
				</span>

				<Divider orientation="vertical" />
				<div className="flex flex-col">
					<span className="text-xs font-medium">Date</span>
					<span className="text-[0.6rem]">
						{new Date().toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}

function MatchHistoryCard() {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	return (
		<Card
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
						onClose={onClose}
						isOpen={isOpen}
						onOpenChange={onOpenChange}
						trigger={
							<Button
								onClick={onOpen}
								variant="transparent"
								startContent={<Expand />}
							>
								See More
							</Button>
						}
					>
						<div className="relative grid h-full grid-cols-1 grid-rows-matches flex-col gap-2">
							{Array.from({ length: 8 }).map((_, i) => (
								<MatchHistoryEntry
									user1="pfp.png"
									user2="pfp2.png"
									result={
										["win", "lose", "tie"][
											Math.floor(Math.random() * 3)
										] as any
									}
								/>
							))}
						</div>
					</ModalSet>
				</div>
			}
			fullWidth
		>
			<div className="relative grid h-full grid-cols-1 grid-rows-matches flex-col gap-2">
				{/* <div className="absolute inset-0 flex justify-center items-center">
							<marquee scrollamount="100" className="text-white text-xl blur-[1px]">
								Nothing 👍
							</marquee>
						</div> */}
				<MatchHistoryEntry
					user1="pfp.png"
					user2="pfp2.png"
					result="win"
				/>
				<MatchHistoryEntry
					user1="pfp.png"
					user2="pfp2.png"
					result="lose"
				/>
				<MatchHistoryEntry
					user1="pfp.png"
					user2="pfp2.png"
					result="tie"
				/>
			</div>
		</Card>
	);
}

function FriendsCard() {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	return (
		<Card
			header={"Friends"}
			footer={
				<div className="flex w-full justify-end">
					<ModalSet
						onClose={onClose}
						isOpen={isOpen}
						onOpenChange={onOpenChange}
						trigger={
							<Button
								onClick={onOpenChange}
								variant="transparent"
								startContent={<Expand />}
							>
								See More
							</Button>
						}
					>
						<div className="relative grid h-full grid-cols-1 grid-rows-matches flex-col gap-2">
							{Array.from({ length: 8 }).map((_, i) => (
								<MatchHistoryEntry
									user1="pfp.png"
									user2="pfp2.png"
									result={
										["win", "lose", "tie"][
											Math.floor(Math.random() * 3)
										] as any
									}
								/>
							))}
						</div>
					</ModalSet>
				</div>
			}
			fullWidth
		>
			<div className="w-full p-2 @container">
				<div className="flex flex-col flex-wrap gap-2 @4xl:grid @4xl:grid-cols-7">
					{Array.from({ length: 7 }).map((_, i) => (
						<div className="relative flex h-16 w-full items-center gap-4 rounded-xl bg-card-400 p-2 text-white @4xl:aspect-square @4xl:h-auto @4xl:flex-col @4xl:justify-center @4xl:gap-1">
							<div className="aspect-square h-full overflow-hidden rounded-full @4xl:h-3/5">
								<img
									src="/pfp.png"
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-800 to-yellow-400 text-xl shadow-sm shadow-black @4xl:left-[20%] @4xl:right-auto @4xl:top-[10%] @4xl:h-6 @4xl:w-6 @4xl:text-base">
								<span className="bg-gradient-to-tr from-primary to-secondary bg-clip-text  font-medium text-transparent mix-blend-plus-lighter">
									S
								</span>
							</div>
							<div className="flex flex-col items-start text-sm text-white @4xl:items-center ">
								mcharrad
								<Status size="sm" />
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}

export default function Home() {
	const [tab, setTab] = useState("Overview");
	const [extended, setExtended] = useState(false);
	const tabNavRef = useRef(null) as any;
	const originalTabNavTop = useRef(-1) as any;
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

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
		<main className="mb-12 flex w-[1250px] max-w-full flex-col justify-center gap-4">
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
						<Status />
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
			<div className="flex w-full gap-4">
				<div className="z-10 flex aspect-square h-full flex-shrink-0 select-none flex-col items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-tr from-yellow-800 to-yellow-400">
					<div className="flex flex-1 flex-col items-center justify-center gap-2">
						<span className="bg-white bg-gradient-to-tr from-primary to-secondary bg-clip-text text-[10rem] font-bold leading-[8rem] text-transparent mix-blend-plus-lighter">
							S
						</span>
						<Divider />
						<span className="text-white">Division III</span>
						<div></div>
					</div>
				</div>
				<MatchHistoryCard />
			</div>
			<FriendsCard />

			<Card
				footer={
					<div className="flex w-full justify-end">
						<ModalSet
							onClose={onClose}
							isOpen={isOpen}
							onOpenChange={onOpenChange}
							trigger={
								<Button
									onClick={onOpenChange}
									variant="transparent"
									startContent={<Expand />}
								>
									See More
								</Button>
							}
						>
							<div className="relative grid h-full grid-cols-1 grid-rows-matches flex-col gap-2">
								{Array.from({ length: 8 }).map((_, i) => (
									<MatchHistoryEntry
										user1="pfp.png"
										user2="pfp2.png"
										result={
											["win", "lose", "tie"][
												Math.floor(Math.random() * 3)
											] as any
										}
									/>
								))}
							</div>
						</ModalSet>
					</div>
				}
				header={"Achievements"}
				fullWidth
			>
				<div className="grid w-full grid-cols-3 gap-2 p-2">
					{Array.from({ length: 3 }).map((_, i) => (
						<div className="flex h-32 overflow-hidden rounded-xl bg-card-400">
							<div
								className="relative flex h-full w-2/5 flex-shrink-0 items-center
							justify-center
							rounded-full after:absolute after:inset-0 after:translate-x-1/2 after:bg-gradient-to-r after:from-transparent after:via-card-400 after:to-transparent after:content-['']"
							>
								<img
									src="/pfp.png"
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="z-20 flex flex-col items-start justify-between py-2 pr-4">
								<div className="flex flex-col text-white">
									<span className="line-clamp-1">
										Lorem, ipsum dolor sit amet consectetur
										adipisicing elit. Voluptatibus saepe
										nobis voluptas delectus dicta aliquam
										fuga aperiam ex? Similique expedita
										ullam velit culpa explicabo laudantium!
										Vitae pariatur inventore laboriosam nam?
									</span>
									<span className="line-clamp-3 text-sm text-background-900">
										Lorem ipsum dolor sit amet consectetur
										adipisicing elit. Minus ad rerum facere,
										nihil accusamus ex magni ratione
										laborum, temporibus quidem animi
										debitis! Sed id et itaque nihil, odit
										expedita veritatis?
									</span>
								</div>
								<div className="flex justify-between w-full">
									<AchievementScore size="sm" />
									<span className="ml-auto text-sm">
										{new Date().toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="flex flex-col gap-4 p-2 pt-4">
					<div className="h-2 w-full rounded-full bg-black overflow-hidden">
						<div className="w-3/4 h-full bg-secondary">

						</div>

					</div>
					<div className="flex justify-between">
						<AchievementScore />
						<span className="text-xl font-medium text-white">
							75%
						</span>
					</div>
				</div>
			</Card>
			<Card header="Stats">
				<div className="p-4">

					<Chart />
				</div>
			</Card>
		</main>
	);
}
