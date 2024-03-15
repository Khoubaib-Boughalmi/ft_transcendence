"use client";
import Divider from "@/components/Divider";
import ModalSet from "@/components/ModalSet";
import NoData from "@/components/NoData";
import SuperImage from "@/components/SuperImage";
import { getFlag, getRank } from "@/lib/utils";
import { Match, User } from "@/types/profile";
import { useDisclosure } from "@nextui-org/react";
import { Equal, Medal, X } from "lucide-react";

export function MatchHistoryEntry({ match }: { match: Match }) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	const PlayerSide = ({
		user,
		side,
	}: {
		user: User;
		side: "left" | "right";
	}) => {
		return (
			<div
				data-side={side}
				className="group relative flex flex-1 gap-2 overflow-hidden p-2"
			>
				<SuperImage
					width={256}
					height={256}
					alt="Background"
					src={user.banner}
					className="absolute inset-0 h-full w-full scale-150 object-cover blur-sm brightness-50"
				/>
				<div className="z-10 flex w-full items-center gap-4 text-white group-data-[side=right]:flex-row-reverse">
					<div className="relative aspect-square h-full shrink-0 overflow-hidden rounded-full">
						<SuperImage
							height={64}
							width={64}
							alt={user.username}
							src={user.avatar}
							className="h-full w-full"
						/>
					</div>
					<div className="flex max-w-full flex-1 flex-col items-start gap-0.5 overflow-hidden group-data-[side=right]:items-end">
						<span className="w-full max-w-full select-all truncate text-lg leading-4 group-data-[side=right]:text-right">
							{user.username}
						</span>
						<span className="flex items-center justify-center gap-1 text-[0.65rem] leading-3 text-background-900 group-data-[side=right]:flex-row-reverse">
							<span className="font-flag">
								{getFlag(user.country)}
							</span>
							<span>{user.country}</span>
						</span>
					</div>
				</div>
			</div>
		);
	};

	const PlayerSideExtendend = ({
		user,
		side,
		score,
	}: {
		user: User;
		side: "left" | "right";
		score: number;
	}) => {
		return (
			<div
				data-side={side}
				className="group relative w-1/2
			after:absolute after:inset-0 after:top-1/2 after:bg-gradient-to-b after:from-transparent after:to-red-600 after:content-['']
				group-data-[result=tie]:after:to-yellow-600 group-data-[result=win]:after:to-green-600
			"
			>
				<SuperImage
					width={256}
					height={256}
					alt="banner"
					src={user.banner}
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 z-10 flex items-center justify-between p-16 group-data-[side=right]:flex-row-reverse">
					<div className="relative aspect-square h-full overflow-hidden rounded-full">
						<SuperImage
							height={64}
							width={64}
							alt={user.username}
							src={user.avatar}
							className="h-full w-full"
						/>
					</div>
					<div className="text-4xl text-white">{score}</div>
				</div>
			</div>
		);
	};

	const Information = ({ title, value }: any) => {
		return (
			<div className="flex items-center justify-between rounded-full bg-white/10 p-1 px-4 text-xs text-white">
				<span>{title}</span>
				<span className="text-sm">{value}</span>
			</div>
		);
	};

	const UserInformation = ({
		user,
		side,
	}: {
		user: User;
		side: "left" | "right";
	}) => {
		return (
			<div
				data-side={side}
				className="group flex flex-1 gap-2 data-[side=right]:flex-row-reverse"
			>
				<div
					className={`flex aspect-square h-full items-center justify-center rounded-full ${getRank(user.rank).color}`}
				>
					<div
						className={`text-transparent ${getRank(user.rank).color} fuck-css mix-blend-plus-lighter`}
					>
						{getRank(user.rank).name}
					</div>
				</div>
				<div className="flex w-1/2 flex-col">
					<span className="select-all truncate leading-4 group-data-[side=right]:text-right ">
						{user.username}
					</span>
					<span className="flex gap-2 text-[0.55rem] leading-3 group-data-[side=right]:flex-row-reverse">
						<span className="font-flag">
							{getFlag(user.country)}
						</span>
						{user.country}
					</span>
				</div>
			</div>
		);
	};

	return (
		<ModalSet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={onClose}
			trigger={
				<div
					onClick={onOpen}
					className="relative flex h-16 w-full  cursor-pointer overflow-hidden rounded-3xl bg-black brightness-90 transition-all @container hover:scale-105 hover:brightness-110"
				>
					<PlayerSide user={match.user1} side={"left"} />
					<div
						data-result={match.result}
						className="z-10 flex items-center justify-center  gap-4 p-4 text-white"
					>
						<Divider orientation="vertical" />
						<span className="flex aspect-square h-full items-center justify-center">
							{match.score1}
						</span>
						<div className=" flex aspect-square items-center justify-center rounded-full bg-white/25 p-2">
							{match.result == "win" ? (
								<Medal size={28} />
							) : match.result == "lose" ? (
								<X size={28} />
							) : (
								<Equal size={28} />
							)}
						</div>
						<span className="flex aspect-square h-full items-center justify-center">
							{match.score2}
						</span>
						<Divider orientation="vertical" />
					</div>
					<PlayerSide user={match.user2} side={"right"} />
					<div
						data-result={match.result}
						className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent p-4 text-white data-[result=lose]:via-red-600 data-[result=tie]:via-yellow-400"
					></div>
				</div>
			}
		>
			<div
				data-result={match.result}
				className="group relative aspect-video w-full overflow-hidden rounded-xl bg-red-600
				after:absolute after:inset-0 after:top-1/2 after:bg-gradient-to-b after:from-transparent after:to-red-800 after:content-['']
				data-[result=tie]:bg-yellow-600 data-[result=win]:bg-green-600
				data-[result=tie]:after:to-yellow-800 data-[result=win]:after:to-green-800
			"
			>
				<div
					className="relative flex h-1/2
						after:absolute after:inset-0 after:inset-x-[-10%] after:bg-gradient-to-r after:from-transparent after:via-red-600 after:to-transparent after:content-['']
						group-data-[result=tie]:after:via-yellow-600 group-data-[result=win]:after:via-green-600
					"
				>
					<div className="absolute inset-0 z-10 flex items-center  justify-center p-24">
						<div className="flex aspect-square h-full items-center justify-center rounded-full bg-white/25 p-4 text-white">
							{match.result == "win" ? (
								<Medal size={28} />
							) : match.result == "lose" ? (
								<X size={28} />
							) : (
								<Equal size={28} />
							)}
						</div>
					</div>
					<PlayerSideExtendend
						user={match.user1}
						side="left"
						score={match.score1}
					/>
					<PlayerSideExtendend
						user={match.user2}
						side="right"
						score={match.score2}
					/>
				</div>
				<div className="absolute inset-0 top-[35%]  z-10 flex flex-col justify-end gap-2 px-8 pb-8">
					<div className="mb-4 flex w-full justify-between rounded-full bg-black/25 p-2 px-2 text-white">
						<UserInformation user={match.user1} side="left" />
						<UserInformation user={match.user2} side="right" />
					</div>
					<Information title="Type" value={match.type} />
					<Information title="Map" value={match.map} />
					<Information title="League" value={match.league} />
					<Information title="Duration" value={match.duration} />
					<Information
						title="Date"
						value={new Date(match.date).toLocaleDateString()}
					/>
				</div>
			</div>
		</ModalSet>
	);
}

export default function MatchHistoryList({ history }: { history: Match[] }) {
	return (
		<div className="relative grid h-full grid-cols-1 grid-rows-matches flex-col gap-2">
			{history.length == 0 && (
				<>
					<div></div>
					<NoData />
				</>
			)}
			{history.map((match: Match, i) => (
				<MatchHistoryEntry key={i} match={match} />
			))}
		</div>
	);
}
