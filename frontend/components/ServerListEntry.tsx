"use client";
import { Button } from "@/components/Button";
import SuperImage from "@/components/SuperImage";
import {
	AirVent,
	ArrowLeft,
	ArrowRight,
	Check,
	Compass,
	Globe,
	Globe2,
	LogOut,
	MailPlus,
	Menu,
	MessageSquarePlus,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	SendHorizontal,
	Server as ServerIcon,
	Settings2,
	Sparkles,
	Trash2,
	UserPlus2,
	Users2,
	X,
} from "lucide-react";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { twMerge } from "tailwind-merge";
import UserList from "@/components/UserList";
import { user1, user2 } from "@/mocks/profile";
import {
	Dropdown,
	DropdownItem,
	DropdownTrigger,
	ScrollShadow,
	Spinner,
	Switch,
	Textarea,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import Input from "@/components/Input";
import { User } from "@/types/profile";
import generateBullshitExpression from "@/lib/bullshit";
import Divider from "@/components/Divider";
import { SuperDropdown, SuperDropdownMenu } from "@/components/SuperDropdown";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import {
	useChatContext,
	randomString,
	fetcher,
	makeForm,
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
} from "@/lib/utils";
import ModalSet from "@/components/ModalSet";
import Card from "@/components/Card";
import PublicContext from "@/contexts/PublicContext";
import SettingSection from "@/components/SettingSection";
import SuperSwitch from "@/components/SuperSwitch";
import UploadButton from "@/components/UploadButton";
import DeleteButton from "@/components/DeleteButton";
import socket from "@/lib/socket";
import NoData from "@/components/NoData";
import toast from "react-hot-toast";
import Status from "@/components/Status";
import MessageInput from "@/components/MessageInput";
import { Server, Message, ChatContextType, Argument, Command } from "@/types/chat";
import { commands } from "@/constants/chat";
import ChatContext from "@/contexts/ChatContext";
import { useRouter } from "next/navigation";


export default function ServerListEntry({ server }: { server: Server }) {
	const router = useRouter();
	const { session } = useContext(PublicContext) as any;
	const { expanded, selectedServerId, setSelectedServerId } =
		useChatContext();

	return (
		<Button
			onClick={() => {
				setSelectedServerId(server.id);
				router.push(`/chat/channel/${server.id}`);
			}}
			variant="transparent"
			className={twMerge(
				"left-20 flex h-20 w-full justify-start gap-0 rounded-none p-0 pr-4 !outline-0 !ring-0	",
				selectedServerId == server.id && "bg-card-400",
			)}
		>
			<div className="relative aspect-square h-full flex-shrink-0 p-4">
				<div className="relative aspect-square h-full">
					<SuperImage
						width={64}
						height={64}
						alt={server.name}
						src={server.icon}
						className={twMerge(
							"absolute inset-0 aspect-square h-full w-full rounded-2xl object-cover",
							server.isDM && "rounded-full",
						)}
					/>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				<div
					className={twMerge(
						"flex h-full flex-col items-start justify-center overflow-hidden",
						expanded && "animate-lefttoright",
						!expanded && "animate-righttoleft",
					)}
				>
					<div className="max-w-full truncate text-sm">
						{server.name}
					</div>
					{!server.isDM ? (
						<div className="max-w-full truncate text-xs text-foreground-500">
							{server.description}
						</div>
					) : (
						<Status
							userId={
								server.membersIds.find(
									(id) => id != session.id,
								) || ""
							}
						/>
					)}
				</div>
			</div>
		</Button>
	);
}