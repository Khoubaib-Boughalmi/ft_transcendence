"use client";
import { Button } from "@/components/Button";
import SuperImage from "@/components/SuperImage";
import { Server } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import UserList from "@/components/UserList";
import { user1, user2 } from "@/mocks/profile";
import { Textarea } from "@nextui-org/react";
import Input from "@/components/Input";

function ChatIcon() {
	return (
		<Button
			variant="transparent"
			className="left-20 flex h-20 w-full justify-start gap-0 rounded-none bg-card-300 p-0 !outline-0 !ring-0"
		>
			<div className="relative aspect-square h-full flex-shrink-0 p-4">
				<div className="relative h-full w-full">
					<SuperImage
						src="/pfp.png"
						className="absolute inset-0 rounded-full"
					/>
				</div>
			</div>
			<div className="flex h-full flex-col items-start justify-center">
				<div className="text-sm">servername</div>
				<div className="text-xs text-foreground-500">something</div>
			</div>
		</Button>
	);
}

function MessageListEntry({ message }: any) {
	// if the date is toady then show today, else show the date
	const date = message.time.toLocaleDateString();
	const time = message.time.toLocaleTimeString();
	const dateStr = date == new Date().toLocaleDateString() ? "Today" : date;

	return (
		<div className="flex gap-4 px-4">
			<div className={twMerge("relative h-12 w-12 flex-shrink-0", message.noAvatar && "h-0 opacity-0")}>
				<SuperImage
					src={message.user.avatar}
					className="absolute inset-0 rounded-full"
				/>
			</div>
			<div className={twMerge("jsutify-end flex flex-col", message.noAvatar && "-mt-4")}>
				<div className={twMerge("flex items-center gap-2 text-sm text-foreground-600", message.noAvatar && "hidden")}>
					<div className="line-clamp-1">
						{message.user.username}
					</div>
					<div suppressHydrationWarning className="text-xs text-foreground-500 flex-shrink-0">
						{dateStr + " at " + time}
					</div>
				</div>
				<div className="text-foreground-800">
					{message.content}
				</div>
			</div>
		</div>
	);
}

export default function Page() {
	const [expanded, setExpanded] = useState(false);
	const list = Array.from({ length: 10 })
		.map((_, i: number) => (i % 2 == 0 ? user1 : user2))
		.sort((user1, user2) => (user1.status == "Online" ? -1 : 1));

	const messages = Array.from({ length: 10 }).map((_, i: number) => ({
		user: i % 4 == 0 ? user1 : user2,
		time: new Date(),
		content: `Lorem ipsum dolor sit amet consectetur, adipisicing elit.
		Pariatur blanditiis totam minima voluptas natus possimus,
		consequuntur similique molestiae atque neque libero ut,
		porro quod exp delectus distinctio officiis! Sequi,
		explicabo!`,
		noAvatar: false,
	}));
	
	console.log(messages);

	for (let i = 0; i < messages.length; i++) {
		if (i > 0 && messages[i].user.username == messages[i - 1].user.username) {
			messages[i].noAvatar = true;
		}
	}



	return (
		<div suppressHydrationWarning className="relative z-10 mb-12 w-5/6 rounded-3xl overflow-hidden">
			<div className="flex h-full w-64 flex-col overflow-hidden rounded-l-3xl bg-card-300">
				<div className="relative flex-1">
					<div className="absolute inset-0 overflow-y-scroll">
						{Array.from({ length: 100 }).map((something) => (
							<ChatIcon />
						))}
					</div>
				</div>
				<div className="h-20 w-full bg-card-200">
					<Button
						variant="transparent"
						onClick={() => {
							setExpanded(!expanded);
						}}
						className="flex aspect-square h-full items-center justify-center rounded-none rounded-bl-3xl !outline-none !ring-0"
					>
						<Server className="mix-blend-plus-lighter" />
					</Button>
				</div>
			</div>
			<div
				className={twMerge(
					"absolute inset-0 left-20 flex flex-col overflow-hidden rounded-r-3xl bg-card-400 transition-transform",
					expanded && "translate-x-44",
				)}
			>
				<div className="flex h-full w-full">
					<div className="flex flex-1 flex-col">
						<div className="flex h-20 w-full flex-shrink-0 gap-2 bg-card-200 px-2">
							<div className="aspect-square h-full p-4">
								<div className="relative h-full w-full flex-shrink-0">
									<SuperImage
										className="absolute inset-0 rounded-full"
										src="/pfp.png"
									/>
								</div>
							</div>
							<div className="flex flex-col justify-center">
								<div className="text-sm">servername</div>
								<div className="text-xs text-foreground-500">
									something
								</div>
							</div>
						</div>
						<div className="relative flex-1">
							<div className="absolute inset-0 overflow-y-scroll">
								<div suppressHydrationWarning className="flex min-h-full flex-col-reverse gap-4 py-4 pl-2">
									{messages.map((message) => (
										<MessageListEntry
											message={message}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="w-full flex-shrink-0 bg-card-500 p-4 h-20">
							<Input />
						</div>
					</div>
					<div className="no-scrollbar h-full w-64 flex-shrink-0 overflow-y-scroll rounded-r-3xl bg-card-300">
						<UserList
							type="list"
							classNames={{
								list: "gap-0",
								entryContainer: "rounded-none px-4 bg-card-400 py-2",
								entry: twMerge("", expanded && "hover:scale-100")
							}}
							users={list}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
