"use client";

import PublicContext from "@/contexts/PublicContext";
import socket from "@/lib/socket";
import { fetcher } from "@/lib/utils";
import { dummyUser } from "@/mocks/profile";
import { Message } from "@/types/chat";
import { NextUIProvider } from "@nextui-org/react";
import jwt from "jsonwebtoken";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import useSWR, { mutate } from "swr";
import ContextMenuPortal from "./ContextMenuPortal";
import { useServerId } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Providers({ accessToken, children }: any) {
	const noRefresh = {
		shouldRetryOnError: false,
		errorRetryCount: 0,
		refreshInterval: 1000,
	};

	const {
		data: session,
		isLoading: sessionLoading,
		mutate: sessionMutate,
	} = useSWR("/user/profile", fetcher, noRefresh) as any;
	const {
		data: verified,
		isLoading: verifiedLoading,
		mutate: verifiedMutate,
	} = useSWR("/auth/verify", fetcher, noRefresh);
	const [loadedImages, setLoadedImages] = useState<string[]>([]);
	const payload = jwt?.decode(accessToken?.value) as any;
	const twoFactorAuthenticated = payload?.two_factor_passed === true;
	const [expecting, setExpecting] = useState(false);
	const [notifications, setNotifications] = useState<Message[] | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		const sessionNotifications =
			window.localStorage.getItem("notifications");
		if (notifications == null)
			setNotifications(JSON.parse(sessionNotifications ?? "[]"));
		else
			window.localStorage.setItem(
				"notifications",
				JSON.stringify(notifications),
			);
	}, [notifications]);

	useEffect(() => {
		socket.connect();
		socket.on("disconnect", () => {});
		socket.on("mutate", (key) => {
			mutate(key);
		});
		socket.on("notifications", async (message: Message) => {
			const serverId = useServerId(pathname);
			session &&
				message.user.id != session.id &&
				(!serverId || serverId != message.chatId) &&
				setNotifications((prev: Message[] | null) => [
					...(prev ?? []),
					message,
				]);
		});

		return () => {
			socket.off("disconnect");
			socket.off("mutate");
			socket.off("notifications");
		};
	}, [accessToken, session]);

	return (
		<PublicContext.Provider
			value={{
				loadedImages,
				sessionMutate,
				setLoadedImages,
				accessToken,
				sessionLoading,
				verifiedLoading,
				verified,
				twoFactorAuthenticated,
				expecting,
				notifications,
				setNotifications,
				setExpecting,
				fullMutate: () =>
					Promise.all([sessionMutate(), verifiedMutate()]),
				session: {
					...dummyUser,
					...(session as any),
				},
			}}
		>
			<ContextMenuPortal>
				<ThemeProvider defaultTheme="red">
					<NextUIProvider>{children}</NextUIProvider>
				</ThemeProvider>
				<Toaster
					toastOptions={{
						className: "!bg-card-500 !text-white !p-4",
					}}
					position="bottom-left"
				/>
			</ContextMenuPortal>
		</PublicContext.Provider>
	);
}
