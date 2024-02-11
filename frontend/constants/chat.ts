import { Command } from "../types/chat";

export const commands: Command[] = [
	{
		name: "/kick",
		description: "Removes a user from the channel.",
		arguments: [
			{
				name: "username",
				description: "The username of the user to kick.",
			},
		],
	},
	{
		name: "/ban",
		description: "Bans a user from the channel.",
		arguments: [
			{
				name: "username",
				description: "The username of the user to ban.",
			},
		],
	},
	{
		name: "/unban",
		description: "Unbans a user from the channel.",
		arguments: [
			{
				name: "username",
				description: "The username of the user to unban.",
			},
		],
	},
	{
		name: "/mute",
		description: "Mutes a user in the channel.",
		arguments: [
			{
				name: "username",
				description: "The username of the user to mute.",
			},
			{
				name: "duration",
				description: "The duration of the mute in seconds.",
			},
		],
	},
	{
		name: "/unmute",
		description: "Unmutes a user in the channel.",
		arguments: [
			{
				name: "username",
				description: "The username of the user to unmute.",
			},
		],
	},
];

export const maxMessageLength = 1024;