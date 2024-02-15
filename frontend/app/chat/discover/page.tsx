"use client";
import { Button } from "@/components/Button";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import ModalSet from "@/components/ModalSet";
import NoData from "@/components/NoData";
import SuperImage from "@/components/SuperImage";
import PublicContext from "@/contexts/PublicContext";
import {
	fetcher,
	makeForm,
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
	useChatContext,
} from "@/lib/utils";
import { Server } from "@/types/chat";
import { useDisclosure } from "@nextui-org/react";
import { ArrowRight, Check, Globe2, Plus, Search, Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { twMerge } from "tailwind-merge";

function ServerCreationModal({
	isOpen,
	onClose,
	onOpenChange,
	children,
}: {
	isOpen: boolean;
	onClose: any;
	onOpenChange: any;
	children: ReactNode;
}) {
	const { expanded, serversMutate, servers, setExpanded } = useChatContext();
	const { sessionMutate, setExpecting } = useContext(PublicContext) as any;
	const [createLoading, setCreateLoading] = useState(false);
	const [joinLoading, setJoinLoading] = useState(false);
	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string).trim();
		if (name == "") return;
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/chat/channel/create`,
			makeForm({ name }),
			setCreateLoading,
			`Successfully created the channel`,
			`Failed to create the channel`,
			async () => {
				setExpecting(true);
				await serversMutate();
				onClose();
				(e.target as HTMLFormElement).reset();
			},
		);
	};

	const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = (formData.get("name") as string).trim();
		const password = (formData.get("password") as string).trim();
		if (name == "") return;
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/chat/channel/join`,
			makeForm({ name, password: [password, undefined][+!password] }),
			setJoinLoading,
			`Successfully joined the channel`,
			`Failed to join the channel`,
			async () => {
				setExpecting(true);
				await serversMutate();
				onClose();
				(e.target as HTMLFormElement).reset();
			},
		);
	};

	return (
		<ModalSet
			isOpen={isOpen}
			onClose={onClose}
			onOpenChange={onOpenChange}
			trigger={children}
			title="Advanced Options"
		>
			<div className="p-2">
				<Card header={"Create a Channel"} className="bg-card-200">
					<form
						onSubmit={handleCreate}
						className="flex flex-col items-end gap-4 p-4"
					>
						<p className="w-full">
							Channels are where your members communicate. They're
							best when organized around a topic - #games for
							example.
						</p>
						<div className="flex h-12 w-full gap-4">
							<Input
								name="name"
								placeholder="Enter a name"
								classNames={{
									container: "flex-1 w-auto",
								}}
								disabled={createLoading}
							/>
							<div className="flex aspect-square h-full items-center justify-center">
								<Button
									type="submit"
									className="aspect-square flex-shrink-0 rounded-full"
									startContent={<Plus />}
									iconOnly
									loading={createLoading}
								></Button>
							</div>
						</div>
					</form>
				</Card>
				<div className="my-4 flex items-center gap-4">
					<Divider /> OR <Divider />
				</div>
				<Card header="Join a Channel" className="bg-card-200">
					<form
						onSubmit={handleJoin}
						className="flex flex-col items-end gap-4 p-4"
					>
						<p className="w-full">
							Enter a channel name and password to join an
							existing channel.
						</p>
						<div className="flex h-12 w-full">
							<Input
								disabled={joinLoading}
								name="name"
								placeholder="Enter the channel name"
								classNames={{
									container: "flex-1 w-auto",
								}}
							/>
						</div>
						<div className="flex h-12 w-full">
							<Input
								disabled={joinLoading}
								name="password"
								type="password"
								placeholder="Enter the password (optional)"
								classNames={{
									container: "flex-1 w-auto",
								}}
							/>
						</div>
						<Button
							type="submit"
							className="h-12 flex-shrink-0 rounded-full pl-6"
							endContent={<ArrowRight />}
							loading={joinLoading}
						>
							Join
						</Button>
					</form>
				</Card>
			</div>
		</ModalSet>
	);
}

function DiscoverListEntry({ server }: { server: Server }) {
	const router = useRouter();
	const { servers } = useChatContext();
	const { serversMutate, navigateToServer } = useChatContext();
	const [loading, setLoading] = useState(false);

	const handleJoin = () => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/chat/channel/join`,
			makeForm({ name: server.name }),
			setLoading,
			`Successfully joined the channel`,
			`Failed to join the channel`,
			async () => {
				await serversMutate();
			},
		);
	};

	return (
		<div className="flex aspect-video w-full flex-col rounded-3xl bg-card-200">
			<div className="relative z-10 flex-1 overflow-hidden rounded-t-3xl">
				<SuperImage
					width={64}
					height={64}
					alt={server.name}
					src={server.icon}
					className="absolute inset-0 -z-10 h-full w-full scale-150 rounded object-cover opacity-75 blur-md"
				/>
				<div className="flex h-full w-full items-end justify-end p-4">
					<div className="flex gap-0 rounded-3xl bg-card-300 p-2">
						<div className="flex items-center justify-center gap-1 px-4">
							<Users2 size={18} />
							<span className="text-xs">{server.size}</span>
						</div>
						{!servers?.find((s) => s.id == server.id) ? (
							<Button
								loading={loading}
								onClick={handleJoin}
								startContent={<Plus size={18} />}
							>
								Join
							</Button>
						) : (
							<Button
								onClick={() => {
									navigateToServer(server.id);
								}}
								startContent={<Check size={18} />}
							>
								Open
							</Button>
						)}
					</div>
				</div>
			</div>
			<div className="z-20 flex min-h-[50%] w-full shrink-0 flex-col gap-4">
				<div className="flex h-16 	items-center gap-4 pl-4">
					<div className="relative h-full w-24 shrink-0 bg-black">
						<div className="absolute inset-x-0 bottom-0 aspect-square">
							<SuperImage
								width={64}
								height={64}
								alt={server.name}
								src={server.icon}
								className="absolute inset-0 h-full w-full rounded-xl object-cover"
							/>
						</div>
					</div>
					<div className="flex h-12 w-full min-w-0 flex-col items-start justify-center overflow-hidden">
						<span className="truncate">{server.name}</span>
						<span className="flex items-center gap-1 truncate text-xs text-foreground-500">
							<Globe2 size={12} /> Public
						</span>
					</div>
				</div>
				<div className="flex-1 rounded-b-3xl bg-black/25 p-4 text-foreground-400">
					<div className="line-clamp-1">{server.description}</div>
				</div>
			</div>
		</div>
	);
}

export default function DiscoverPage() {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const { cache } = useSWRConfig();
	const [query, setQuery] = useState("");
	const [realQuery, setRealQuery] = useState("");
	const { data: servers, isLoading } = useSWR(
		`/chat/channel/search/${realQuery}`,
		fetcher,
	) as any;

	useEffect(() => {
		const timeout = setTimeout(() => {
			setRealQuery(query);
		}, 500);
		return () => {
			clearTimeout(timeout);
			cache.delete(`/chat/channel/search/${realQuery}`);
		};
	}, [query]);

	return (
		<div className="no-scrollbar flex min-h-full w-full flex-col overflow-y-scroll">
			<div
				className={twMerge(
					"h-2/3 w-full shrink-0 p-12 transition-all",
					isLoading && "h-full",
				)}
			>
				<div className="relative h-full w-full overflow-hidden rounded-xl bg-card-200">
					<div className="h-full w-full">
						<SuperImage
							width={1280}
							height={720}
							alt="background"
							src="/background3.png"
							className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-color-dodge brightness-90"
						/>
					</div>
					<div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2">
						<div className="flex items-end justify-center text-4xl font-medium">
							Find your community on 1337
						</div>
						<p className="text-center text-foreground-500">
							From gaming, to music, to learning, there's a place
							for you.
						</p>
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							classNames={{
								container: "w-1/2 mt-4 bg-card-400 px-3  ",
							}}
							placeholder="Enter a keyword"
							startContent={
								<Search className="text-background-800" />
							}
						/>
						<div className="flex flex-col items-center justify-center gap-8 pt-6">
							<ServerCreationModal
								isOpen={isOpen}
								onClose={onClose}
								onOpenChange={onOpenChange}
							>
								<Button
									onClick={onOpen}
									variant="ghost"
									className="h-12 rounded-full"
									startContent={<Plus />}
								>
									Advanced Options
								</Button>
							</ServerCreationModal>
						</div>
					</div>
				</div>
			</div>
			<Divider className="shrink-0" />
			<div className="relative  flex-1 flex-shrink-0 grid-cols-1 gap-4 p-12 @container">
				{servers?.length == 0 && (
					<div className="flex h-full items-center justify-center">
						<NoData />
					</div>
				)}
				<div
					className="grid grid-cols-1 gap-4
					@3xl:grid-cols-2 @6xl:grid-cols-3 @[96rem]:grid-cols-4
				"
				>
					{servers?.map((server: Server, i: number) => (
						<DiscoverListEntry key={server.id} server={server} />
					))}
				</div>
			</div>
		</div>
	);
}
