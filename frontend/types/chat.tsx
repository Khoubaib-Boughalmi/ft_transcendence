import { User } from './profile'

export type Server = {
	name: string;
	description: string;
	icon: string;
	id: string;
	members: User[];
	enable_password: boolean;
	enable_inviteonly: boolean;
	owner: string;
	admins: string[];
	invites: User[];
	size?: number;
	isDM: boolean;
	membersIds: string[];
};

export type Message = {
	id: string;
	user: User;
	createdAt: Date;
	updatedAt: Date;
	content: string;
	target: string;
	noAvatar: boolean;
	blocked?: boolean;
	chatId: string;
	parent?: boolean;
	groupid: string;
	loaded: boolean;
};

export type ChatContextType = {
	akashicRecords: { [key: string]: Message[] };
	displayedMessages: any;
	expanded: boolean;
	listTab: "servers" | "friends";
	members: User[];
	selectedServerBans: User[];
	selectedServerInvites: User[];
	messageParents: any;
	messages: Message[];
	selectedServer: Server | undefined;
	selectedServerId: string | null;
	servers: Server[];
	serversMutate: () => Promise<void>;
	setAkashicRecords: (records: { [key: string]: Message[] }) => void;
	setDisplayedMessages: (displayedMessages: any) => void;
	setExpanded: (expanded: boolean) => void;
	setListTab: (tab: "servers" | "friends") => void;
	setSelectedServerId: (selectedServerId: string | null) => void;
	setShowMembers: (showMembers: boolean) => void;
	showMembers: boolean;
	serverMutate: () => Promise<void>;
	prevSelectedServerId: any;
};

export type Argument = {
	name: string;
	description: string;
};

export type Command = {
	name: string;
	description: string;
	arguments: Argument[];
};