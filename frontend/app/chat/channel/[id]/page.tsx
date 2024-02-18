"use client";
import { Button } from "@/components/Button";
import Card from "@/components/Card";
import ContextMenuTrigger from "@/components/ContextMenuTrigger";
import DeleteButton from "@/components/DeleteButton";
import Divider from "@/components/Divider";
import GayMarkdown from "@/components/GayMarkdown";
import Input from "@/components/Input";
import MessageInput from "@/components/MessageInput";
import MessageLengthIndicator from "@/components/MessageLengthIndicator";
import ModalSet from "@/components/ModalSet";
import SettingSection from "@/components/SettingSection";
import Status from "@/components/Status";
import { SuperDropdown, SuperDropdownMenu } from "@/components/SuperDropdown";
import SuperImage from "@/components/SuperImage";
import SuperSwitch from "@/components/SuperSwitch";
import UploadButton from "@/components/UploadButton";
import UserList from "@/components/UserList";
import { commands, maxMessageLength } from "@/constants/chat";
import ContextMenuContext from "@/contexts/ContextMenuContext";
import PublicContext from "@/contexts/PublicContext";
import generateBullshitExpression from "@/lib/bullshit";
import socket from "@/lib/socket";
import {
	makeForm,
	randomString,
	AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
	useChatContext,
	useContextMenu,
} from "@/lib/utils";
import { Message } from "@/types/chat";
import { User } from "@/types/profile";
import {
	DropdownItem,
	DropdownTrigger,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import {
	Check,
	LogOut,
	MoreHorizontal,
	Mouse,
	Pencil,
	Plus,
	Settings2,
	Sparkles,
	Trash,
	UserPlus2,
	Users2,
	X,
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function MemberControls({
	list,
	controls,
}: {
	list: User[];
	controls: ({ user }: { user: User }) => any;
}) {
	return (
		<Card className="relative h-64 overflow-hidden">
			<div className="absolute inset-0 overflow-y-scroll py-2">
				<UserList
					showHover={false}
					Controls={controls}
					type="list"
					users={list}
					classNames={{
						list: "gap-0",
						entryContainer: "bg-transparent py-2",
					}}
				/>
			</div>
		</Card>
	);
}

function InviteBox() {
	const { selectedServerMembers, selectedServer, serverMutate } =
		useChatContext();
	const [loading, setLoading] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handlesubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const username = ((formData.get("name") as string) || "").trim();
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/invite",
			makeForm({
				id: selectedServer?.id,
				username,
			}),
			setLoading,
			`Successfully invited ${username}`,
			`Failed to invite ${username}`,
			async () => {
				await serverMutate();
				formRef.current?.reset();
			},
		);
	};

	return (
		<form
			ref={formRef}
			onSubmit={handlesubmit}
			className="flex w-full gap-4"
		>
			<Input
				disabled={loading}
				classNames={{
					container: "flex-1 h-12",
				}}
				placeholder="Enter a username"
				name="name"
			/>
			<Button
				variant="secondary"
				className="h-12 rounded-full"
				type="submit"
				startContent={<Plus />}
				loading={loading}
			>
				Invite
			</Button>
		</form>
	);
}

function RevokeInviteButton({ user }: { user: User }) {
	const { selectedServerMembers, selectedServer, serverMutate } =
		useChatContext();
	const [loading, setLoading] = useState(false);

	const handlerevokeinvite = (user: User) => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/revoke_invite",
			makeForm({
				chatId: selectedServer?.id,
				userId: user.id,
			}),
			setLoading,
			`Successfully revoked invite to ${user.username}`,
			`Failed to revoke invite to ${user.username}`,
			serverMutate,
		);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handlerevokeinvite(user)}
				className="pl-3"
				startContent={<X />}
				variant="danger"
				loading={loading}
			>
				Revoke Invite
			</Button>
		</div>
	);
}

function RevokeBanButton({ user }: { user: User }) {
	const { selectedServerId, serverMutate } = useChatContext();
	const [loading, setLoading] = useState(false);

	const handlerevokeban = (user: User) => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/revoke_ban",
			makeForm({
				chatId: selectedServerId,
				userId: user.id,
			}),
			setLoading,
			`Successfully unbanned ${user.username}`,
			`Failed to unban ${user.username}`,
			serverMutate,
		);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handlerevokeban(user)}
				className="pl-3"
				startContent={<X />}
				variant="danger"
				loading={loading}
			>
				Revoke Ban
			</Button>
		</div>
	);
}

function RevokeAdminButton({ user }: { user: User }) {
	const { selectedServerId, serverMutate } = useChatContext();
	const [loading, setLoading] = useState(false);

	const handlerevokeadmin = (user: User) => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/remove_admin",
			makeForm({
				chatId: selectedServerId,
				userId: user.id,
			}),
			setLoading,
			`Successfully deopped ${user.username}`,
			`Failed to deop ${user.username}`,
			serverMutate,
		);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handlerevokeadmin(user)}
				className="pl-3"
				startContent={<X />}
				variant="danger"
				loading={loading}
			>
				Demote
			</Button>
		</div>
	);
}

function SettingsModal({ isOpen, onClose, onOpenChange }: any) {
	const {
		selectedServerMembers,
		selectedServerAdmins,
		selectedServer,
		serverMutate,
		selectedServerInvites,
		selectedServerBans,
	} = useChatContext();
	const [passwordEnabled, setPasswordEnabled] = useState(
		selectedServer?.enable_password,
	);

	const formRef = useRef<HTMLFormElement>(null);

	const handlesubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = ((formData.get("name") as string) || "").trim();
		const topic = ((formData.get("topic") as string) || "").trim();
		const password = ((formData.get("password") as string) || "").trim();
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/update",
			makeForm({
				id: selectedServer?.id,
				name: name.length > 0 ? name : undefined,
				description: topic.length > 0 ? topic : undefined,
				password: passwordEnabled ? password : undefined,
			}),
			undefined,
			`Successfully updated the channel`,
			`Failed to update the channel`,
			async () => {
				await serverMutate();
				formRef.current?.reset();
			},
		);
	};

	const handleTogglePassword = (value: boolean) => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/update",
			makeForm({
				id: selectedServer?.id,
				enable_password: value,
			}),
			undefined,
			`Successfully ${
				!value ? "disabled" : "enabled"
			} password protection`,
			`Failed to ${!value ? "disable" : "enable"} password protection`,
			serverMutate,
		);
		setPasswordEnabled(value);
	};



	if (!selectedServer) return null;

	return (
		<ModalSet
			placement="top"
			isOpen={isOpen}
			onClose={onClose}
			onOpenChange={onOpenChange}
			title={selectedServer.name}
		>
			<div className="p-2">
				<Card
					header="General Settings"
					className="bg-card-200"
					footer={
						<div className="flex w-full justify-end">
							<Button
								type="submit"
								form="general"
								startContent={<Check />}
							>
								Submit
							</Button>
						</div>
					}
				>
					<form
						ref={formRef}
						id="general"
						onSubmit={handlesubmit}
						className="hidden"
					/>
					<div className="flex flex-col items-center gap-4 p-4">
						<div className="flex w-full gap-8">
							<div className="aspect-square h-[252px] flex-shrink-0">
								<div className="relative h-full w-full">
									<SuperImage
										width={252}
										height={252}
										alt={selectedServer?.name}
										className="absolute inset-0 aspect-square h-full w-full rounded-2xl object-cover"
										src={selectedServer?.icon}
									/>
								</div>
							</div>
							<div className="flex flex-1 flex-col gap-4">
								<SettingSection title="Channel Name">
									<Input
										form="general"
										classNames={{
											container: "w-auto h-12",
										}}
										placeholder={selectedServer?.name}
										name="name"
									/>
								</SettingSection>
								<SettingSection title="Channel Topic">
									<Input
										form="general"
										classNames={{
											container: "w-auto h-12",
										}}
										placeholder={
											selectedServer?.description
										}
										name="topic"
									/>
								</SettingSection>
								<SettingSection title="Channel Icon">
									<div className="flex gap-2">
										<UploadButton
											endpoint="/chat/channel/upload-icon"
											name="icon"
											variant="secondary"
											data={{
												id: selectedServer?.id,
											}}
											callback={async () => {
												await serverMutate();
											}}
										>
											Upload Icon
										</UploadButton>
										<DeleteButton
											data={{
												id: selectedServer?.id,
											}}
											callback={async () => {
												await serverMutate();
											}}
											endpoint="/chat/channel/delete-icon"
											type="icon"
										></DeleteButton>
									</div>
								</SettingSection>
							</div>
						</div>

						<Divider className="my-4" />
						<SettingSection title="Password">
							<div className="flex w-full flex-col gap-4">
								<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
									Enable password protection
									<div className="relative flex flex-1 items-center justify-end">
										<SuperSwitch
											isSelected={passwordEnabled}
											onValueChange={handleTogglePassword}
											className="absolute"
										/>
									</div>
								</div>
								<p className="text-base leading-4">
									When enabled, users will be required to
									enter the password to join the channel.
								</p>
								<Input
									form="general"
									disabled={!passwordEnabled}
									classNames={{
										container: "w-auto h-12",
									}}
									placeholder="Enter a password"
									name="password"
									type="password"
								/>
							</div>
						</SettingSection>
					</div>
				</Card>
				<Divider className="my-8" />
				<Card header={"Member Settings"} className="bg-card-200">
					<div className="flex flex-col items-center gap-4 p-4">
						<SettingSection title="Operators">
							<div className="flex w-full flex-col gap-4">
								<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
									Channel Operators
								</div>
								<MemberControls
									list={selectedServerAdmins}
									controls={RevokeAdminButton}
								/>
							</div>
						</SettingSection>
						<Divider className="my-4" />
						<SettingSection title="Bans">
							<div className="flex w-full flex-col gap-4">
								<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
									Banned users
								</div>
								<MemberControls
									list={selectedServerBans}
									controls={RevokeBanButton}
								/>
							</div>
						</SettingSection>
					</div>
				</Card>
			</div>
		</ModalSet>
	);
}

function MemberList() {
	const { expanded, showMembers, selectedServerMembers, selectedServer } =
		useChatContext();

	return (
		<div
			className={twMerge(
				"no-scrollbar h-full w-80 flex-shrink-0 p-4 transition-all",
				!showMembers && "w-0 px-2",
			)}
		>
			<div
				className="no-scrollbar h-full overflow-hidden
							overflow-y-scroll rounded-3xl bg-gradient-to-t
							from-card-200 to-card-300 py-2"
			>
				<UserList
					type="list"
					hoverDelay={500}
					classNames={{
						list: "gap-0",
						entryContainer:
							"rounded-none px-4 bg-card-400 py-2 bg-transparent",
						entry: twMerge("", expanded && "hover:scale-100"),
					}}
					users={selectedServerMembers}
					showBadge={(user) => {
						const isOwner = selectedServer?.owner == user.id;
						const isAdmin = selectedServer?.admins.includes(
							user.id,
						);

						if (isOwner) return "/owner.png";
						if (isAdmin) return "/hammer.png";
						return null;
					}}
				/>
			</div>
		</div>
	);
}

function ChatInput() {
	const {
		selectedServerMessages,
		akashicRecords,
		setAkashicRecords,
		selectedServerId,
		selectedServer,
	} = useChatContext();
	const { session } = useContext(PublicContext) as any;
	const [message, setMessage] = useState("");
	const [showTooltip, setShowTooltip] = useState(false);
	const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
	const [showCommands, commandsToShow] = useMemo(() => {
		const showCommands = message.startsWith("/") && !selectedServer?.isDM;
		const commandsToShow = showCommands
			? commands.filter((command) =>
					command.name.startsWith(message.split(" ")[0]),
				)
			: [];
		return [showCommands, commandsToShow];
	}, [message, selectedServer?.isDM]);

	const tooltipLogic = () => {
		if (message.length >= maxMessageLength) {
			if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
			setShowTooltip(true);
			tooltipTimeout.current = setTimeout(() => {
				setShowTooltip(false);
			}, 1000);
		}
	};

	return (
		<div className="flex h-20 items-center gap-4 p-4 pr-1">
			<form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					if (!selectedServerId) return;
					e.preventDefault();
					const formData = new FormData(e.target as HTMLFormElement);
					const message = (formData.get("message") as string).trim();
					if (message == "") return;
					const newId = randomString();
					if (!showCommands)
						setAkashicRecords({
							...akashicRecords,
							[selectedServerId]: [
								{
									user: session,
									createdAt: new Date(),
									content: message,
									noAvatar: false,
									target: "server",
									groupid: newId,
									chatId: selectedServerId,
									id: newId,
									updatedAt: new Date(),
									loaded: false,
									queueId: newId,
									error: false,
								},
								...selectedServerMessages,
							],
						});
					if (
						!showCommands ||
						(showCommands && commandsToShow.length > 0)
					)
						setMessage("");

					socket.emit("message", {
						targetId: selectedServer?.isDM
							? selectedServer.membersIds.find(
									(id) => id != session.id,
								)
							: undefined,
						chatId: selectedServerId,
						queueId: newId,
						message,
					});
				}}
				className="h-full w-full flex-1 flex-shrink-0 bg-card-300"
			>
				<div className="relative">
					{showCommands && (
						<div className="absolute bottom-0 flex w-full  animate-overlayfast flex-col rounded-3xl bg-card-200 pb-12">
							<div className="p-2">
								<div className="flex flex-col overflow-hidden rounded-3xl bg-card-300">
									{commandsToShow.length == 0 && (
										<div className="p-4 text-sm text-foreground-500">
											No commands found.
										</div>
									)}
									{commandsToShow.map((command) => (
										<div
											key={command.name}
											className="w-full animate-overlay p-4 text-sm"
										>
											<div className="flex gap-1">
												<span className="font-medium">
													{command.name}
												</span>
												{command.arguments.map(
													(arg) => (
														<Tooltip
															key={arg.name}
															content={
																arg.description
															}
														>
															<div className="transition-colors hover:bg-black/25">
																<span className="text-foreground-600">
																	{`{`}
																</span>
																<span className="text-foreground-500">
																	{arg.name}
																</span>
																<span className="text-foreground-600">
																	{`}`}
																</span>
															</div>
														</Tooltip>
													),
												)}
											</div>
											<div className="text-foreground-500">
												{command.description}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
					<MessageInput
						onKeyDown={tooltipLogic}
						maxLength={maxMessageLength}
						value={message}
						onChange={(e) => {
							setMessage(e.target.value);
						}}
						startContent={
							<MessageLengthIndicator
								showTooltip={showTooltip}
								message={message}
								maxMessageLength={maxMessageLength}
							/>
						}
					/>
				</div>
			</form>
			<Button
				className="aspect-square flex-shrink-0"
				startContent={<Sparkles />}
				iconOnly
				onClick={() => {
					const input = document.querySelector(
						"#message",
					) as HTMLInputElement;
					const bs = generateBullshitExpression(
						["cryptoBS", ""][Math.floor(Math.random() * 2)],
					);
					setMessage((prev) =>
						(prev + " " + bs).slice(0, maxMessageLength),
					);
					input.focus();
				}}
			></Button>
		</div>
	);
}

function MessageContextMenu({
	message,
	children,
}: {
	message: Message;
	children?: any;
}) {
	const date = new Date(message.createdAt).toLocaleDateString();
	const time = new Date(message.createdAt).toLocaleTimeString();
	const dateStr = date == new Date().toLocaleDateString() ? "Today" : date;

	return (
		<div className="flex w-64 flex-col gap-2 rounded-3xl bg-card-250 p-4">
			<div className="flex flex-col">
				<span className="text-xs text-foreground-500">
					{message.user.username}{`'s message`}
				</span>
				<span>{dateStr + " at " + time}</span>
			</div>
			<Divider />
			<div className="flex flex-col">{children}</div>
		</div>
	);
}

function MessageListEntry({
	message,
	index,
}: {
	message: Message;
	index: number;
}) {
	const { closeMenu } = useContextMenu();
	const { session } = useContext(PublicContext) as any;
	const date = new Date(message.createdAt).toLocaleDateString();
	const time = new Date(message.createdAt).toLocaleTimeString();
	const dateStr = date == new Date().toLocaleDateString() ? "Today" : date;
	const {
		displayedMessages,
		setDisplayedMessages,
		messageParents,
		selectedServer,
		serverMutate,
		setAkashicRecords,
		selectedServerId,
	} = useChatContext();
	const displayed =
		displayedMessages[message.groupid] || message.blocked != true;
	const optionsAllowed =
		message.user.id == session.id ||
		((selectedServer?.admins.includes(session.id) ||
			selectedServer?.owner == session.id) &&
			message.user.id != selectedServer?.owner);

	if (message.blocked && !message.parent && displayed != true) return null;

	return (
		<>
			{message.user.id == "server" ? (
				<ContextMenuTrigger
					className="mt-2 flex w-full items-center gap-2 px-6 text-foreground-500 hover:bg-black/15"
					menuContent={
						<MessageContextMenu
							message={{
								...message,
								user: { ...message.user, username: "Server" },
							}}
						></MessageContextMenu>
					}
				>
					<div className="rounded-full bg-card-100 p-2 px-4 text-xs text-white">
						SERVER
					</div>
					<div>{message.content}</div>
				</ContextMenuTrigger>
			) : (
				displayed && (
					<ContextMenuTrigger
						className={twMerge(
							"flex gap-4 rounded-3xl px-8 hover:bg-black/15",
							!message.noAvatar && "mt-4",
							!message.loaded && !message.error && "opacity-50",
						)}
						menuContent={
							<MessageContextMenu message={message}>
								<Button
									onClick={() => {
										AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
											"/chat/channel/message/delete",
											makeForm({
												msgId: message.id,
											}),
											undefined,
											`Successfully deleted the message`,
											`Failed to delete the message`,
										);
										setAkashicRecords((prev) => {
											const newRecords = {
												...prev,
												[selectedServerId!]: prev[
													selectedServerId!
												].map((msg) => {
													if (msg.id == message.id)
														msg.loaded = false;
													return msg;
												}),
											};

											return newRecords;
										});

										closeMenu();
									}}
									startContent={<Trash size={16} />}
									className="w-full justify-start"
									variant="transparent"
									disabled={!optionsAllowed}
								>
									Delete
								</Button>
							</MessageContextMenu>
						}
					>
						<div
							className={twMerge(
								"relative aspect-square h-0 w-11 flex-shrink-0",
								message.noAvatar && "opacity-0",
							)}
						>
							{!message.noAvatar && (
								<SuperImage
									width={48}
									height={48}
									alt={message.user.username}
									src={message.user.avatar}
									className="absolute inset-0 aspect-square rounded-full object-cover"
								/>
							)}
						</div>
						<div
							className={twMerge(
								"flex flex-1 flex-col overflow-hidden",
							)}
						>
							{!message.noAvatar && (
								<div
									className={twMerge(
										"flex items-center gap-2 text-sm text-foreground-600",
									)}
								>
									<div className="line-clamp-1">
										{message.user.username}
									</div>
									<div
										suppressHydrationWarning
										className="flex-shrink-0 text-xs text-foreground-500"
									>
										{dateStr + " at " + time}
									</div>
								</div>
							)}
							<div
								className={twMerge(
									"break-words text-foreground-800",
									message.error && "text-red-600",
								)}
							>
								<GayMarkdown message={message} />
							</div>
						</div>
					</ContextMenuTrigger>
				)
			)}
			{message.blocked && message.parent && (
				<div className="mt-4 flex w-full justify-center gap-4 font-semibold">
					<Button
						variant="ghost"
						className="w-full select-none text-card-900 !outline-none !ring-0"
						onClick={() => {
							setDisplayedMessages((prev: any) => {
								return {
									...prev,
									[message.groupid]:
										prev[message.groupid] == true
											? false
											: true,
								};
							});
						}}
					>
						{(displayed
							? "Hide"
							: `Show ${
									messageParents.current[message.groupid]
								}`) +
							` Blocked Message${
								messageParents.current[message.groupid] == 1
									? ""
									: "s"
							}`}
					</Button>
				</div>
			)}
		</>
	);
}

export default function App({ params }: any) {
	const {
		expanded,
		setExpanded,
		showMembers,
		setShowMembers,
		selectedServerMessages,
		selectedServer,
		selectedServerId,
		serversMutate,
		prevSelectedServerId,
		prevSelectedServerMessages,
		selectedServerInvites,
		serverMutate,
	} = useChatContext();
	const { session } = useContext(PublicContext) as any;
	const messageBoxRef = useRef<HTMLDivElement>(null);
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const {
		isOpen: inviteOpen,
		onOpen: onInviteOpen,
		onClose: onInviteClose,
	} = useDisclosure();
	const [scrollLocked, setScrollLocked] = useState(false);
	const [inviteOnlyEnabled, setInviteOnlyEnabled] = useState(
		selectedServer?.enable_inviteonly,
	);
	const initial = useRef(true);
	const hasPermissions =
		selectedServer?.owner == session?.id ||
		selectedServer?.admins.includes(session?.id);

	useEffect(() => {
		const messageBox = messageBoxRef.current;
		const currentScroll = messageBox?.scrollTop || 0;
		const currentHeight = messageBox?.scrollHeight || 0;
		const visibleHeight = messageBox?.clientHeight || 0;
		const difference = currentHeight - currentScroll;

		if (messageBox) {
			if (
				prevSelectedServerId.current != selectedServerId ||
				(prevSelectedServerMessages.current?.length !=
					selectedServerMessages.length &&
					!scrollLocked) ||
				initial.current
			)
				messageBox.scrollTop = messageBox.scrollHeight + 1;
			initial.current = false;
		}
		prevSelectedServerId.current = selectedServerId;

		const handleScroll = () => {
			if (messageBox) {
				const currentScroll = messageBox.scrollTop;
				const currentHeight = messageBox.scrollHeight;
				const visibleHeight = messageBox.clientHeight;
				const difference = currentHeight - currentScroll;

				if (difference > visibleHeight + 100) {
					setScrollLocked(true);
				} else {
					setScrollLocked(false);
				}
			}
		};

		messageBox?.addEventListener("wheel", handleScroll, {
			passive: true,
		});
		return () => {
			messageBox?.removeEventListener("wheel", handleScroll);
		};
	}, [selectedServerMessages, selectedServerId, messageBoxRef, prevSelectedServerMessages, prevSelectedServerId, scrollLocked]);

	const handleLeave = () => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/leave",
			makeForm({
				id: selectedServer?.id,
			}),
			undefined,
			`Successfully left the channel`,
			`Failed to leave the channel`,
			serversMutate,
		);
	};

	const handleToggleInviteOnly = (value: boolean) => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/chat/channel/update",
			makeForm({
				id: selectedServer?.id,
				enable_inviteonly: value,
			}),
			undefined,
			`Successfully ${!value ? "disabled" : "enabled"} invite only mode`,
			`Failed to ${!value ? "disable" : "enable"} invite only mode`,
			serverMutate,
		);
		setInviteOnlyEnabled(value);
	};

	if (!selectedServer) return null;

	return (
		<>
			<SettingsModal
				key={selectedServer?.id}
				isOpen={isOpen}
				onClose={onClose}
				onOpenChange={onOpenChange}
			/>
			<div className="flex h-full w-full gap-0">
				<div className="flex flex-1 flex-col">
					<div className="flex h-24 w-full flex-shrink-0 p-4 pr-0">
						<div className="flex h-full w-full gap-2 rounded-full bg-card-275">
							<div className="aspect-square h-full p-2">
								<div className="relative h-full w-full flex-shrink-0">
									<SuperImage
										width={64}
										height={64}
										alt={selectedServer.name}
										className="absolute inset-0 aspect-square h-full w-full rounded-full object-cover"
										src={selectedServer.icon}
									/>
								</div>
							</div>
							<div className="flex flex-1 flex-col items-start justify-center overflow-hidden">
								<div className="-mb-1 text-sm">
									{selectedServer.name}
								</div>
								{!selectedServer?.isDM ? (
									<Tooltip
										// className="max-w-[50vw] text-center"
										content={
											<div className="max-w-[50vw]">
												{selectedServer.description}
											</div>
										}
									>
										<div className="line-clamp-2 text-xs text-foreground-500">
											{selectedServer.description}
										</div>
									</Tooltip>
								) : (
									<Status
										className="mt-1"
										userId={
											selectedServer.membersIds.find(
												(id) => id != session.id,
											) || ""
										}
									/>
								)}
							</div>
							<div className="flex shrink-0 items-center justify-end gap-2 px-4">
								{!selectedServer?.isDM && (
									<>
										<ModalSet
											placement="center"
											isOpen={inviteOpen}
											onClose={onInviteClose}
											onOpenChange={onInviteClose}
											title="Invite Users"
										>
											<div className="p-2">

											<div className="p-6 bg-card-200 rounded-3xl">

											<SettingSection title="Invites">
												<div className="flex w-full flex-col gap-4">
													<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
														Enable invite-only
														<div className="relative flex flex-1 items-center justify-end">
															<SuperSwitch
																isSelected={
																	inviteOnlyEnabled
																}
																onValueChange={
																	handleToggleInviteOnly
																}
																className="absolute"
															/>
														</div>
													</div>
													<p className="text-base leading-4">
														When enabled, users will
														need an invite to join
														the channel.
													</p>
													<div
														className={twMerge(
															"flex flex-col gap-4",
															!inviteOnlyEnabled &&
																"pointer-events-none brightness-50",
														)}
													>
														<MemberControls
															list={
																selectedServerInvites
															}
															controls={
																RevokeInviteButton
															}
														/>
														<InviteBox />
													</div>
												</div>
											</SettingSection>
											</div>
											</div>


										</ModalSet>

										<Button
											variant="ghost"
											iconOnly
											onClick={onInviteOpen}
										>
											<UserPlus2 />
										</Button>
									</>
								)}
								<Button
									iconOnly={showMembers == false}
									variant={showMembers ? undefined : "ghost"}
									onClick={() => setShowMembers(!showMembers)}
								>
									<Users2 />
								</Button>
								{!selectedServer?.isDM && (
									<SuperDropdown>
										<DropdownTrigger>
											<div>
												<Button
													variant="transparent"
													iconOnly
												>
													<MoreHorizontal />
												</Button>
											</div>
										</DropdownTrigger>
										<SuperDropdownMenu
											onAction={(action) => {
												if (action == "settings") {
													onOpen();
												} else if (action == "leave") {
													handleLeave();
												}
											}}
										>
											<DropdownItem
												aria-label="Settings"
												key={"settings"}
												startContent={<Settings2 />}
												className={twMerge(
													!hasPermissions && "hidden",
												)}
											>
												Settings
											</DropdownItem>
											<DropdownItem
												aria-label="Leave"
												startContent={<LogOut />}
												data-exclude={true}
												color="danger"
												key={"leave"}
											>
												Leave
											</DropdownItem>
										</SuperDropdownMenu>
									</SuperDropdown>
								)}
							</div>
						</div>
					</div>
					<div className="relative flex-1 animate-slow_fadein">
						<div
							ref={messageBoxRef}
							className="no-scrollbar chatbox absolute inset-0 overflow-y-scroll"
						>
							<div
								suppressHydrationWarning
								className="flex min-h-full flex-col-reverse gap-0 p-2 px-0"
							>
								{selectedServerMessages.map((message, i) => {
									return (
										<MessageListEntry
											key={message.id}
											index={i}
											message={message}
										/>
									);
								})}
								<div className="w-full p-8 pb-0">
									<p className="text-foreground-500">
										{selectedServer.isDM
											? `
												This is the start of your direct messages with ${selectedServer.name}, it's a lonely place...`
											: `This is the start of the
												channel's history, it's a lonely
												place...`}
									</p>
									<p className="text-xl">
										{selectedServer.isDM
											? `Be the first to say hello!`
											: `Invite some friends to get the
												conversation started!`}
									</p>
									{!selectedServer.isDM && (
										<Button
											onClick={onOpen}
											className="mt-2"
											startContent={<Pencil />}
										>
											Edit channel
										</Button>
									)}
									<Divider className="mt-4 bg-card-500 mix-blend-normal" />
								</div>
							</div>
						</div>
					</div>
					<div className="relative h-0 w-full bg-black">
						<div
							className={twMerge(
								"absolute bottom-0 right-0 opacity-0 transition-all",
								scrollLocked && "opacity-100",
							)}
						>
							<Button
								startContent={<Mouse size={16} />}
								variant="ghost"
								disabled={!scrollLocked}
								className={twMerge(
									"animate-pulse disabled:cursor-default",
								)}
								onClick={() => {
									const messageBox = messageBoxRef.current;
									if (messageBox) {
										messageBox.scrollTop =
											messageBox.scrollHeight;
										setScrollLocked(false);
									}
								}}
							>
								Locked
							</Button>
						</div>
					</div>
					<ChatInput />
				</div>
				<MemberList />
			</div>
		</>
	);
}
