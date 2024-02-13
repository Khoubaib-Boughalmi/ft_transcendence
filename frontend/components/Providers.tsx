"use client";

import PublicContext from "@/contexts/PublicContext";
import { NextUIProvider } from "@nextui-org/react";
import axios from "@/lib/axios";
import { fetcher } from "@/lib/utils";
import useSWR, { mutate } from "swr";
import { dummyUser } from "@/mocks/profile";
import { useContext, useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { Toaster } from "react-hot-toast";
import socket from "@/lib/socket";
import { ThemeProvider } from "next-themes";
import { Message } from "@/types/chat";

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
			session && message.user.id != session.id && setNotifications((prev: Message[] | null) => [
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
			<ThemeProvider defaultTheme="red">
				<NextUIProvider>{children}</NextUIProvider>
			</ThemeProvider>
			<Toaster
				toastOptions={{
					className: "!bg-card-500 !text-white !p-4",
				}}
				position="bottom-left"
			/>
		</PublicContext.Provider>
	);
}
