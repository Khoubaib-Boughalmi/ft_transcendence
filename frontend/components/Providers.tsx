"use client";

import PublicContext from "@/contexts/PublicContext";
import { NextUIProvider } from "@nextui-org/react";
import axios from "@/lib/axios";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { dummyUser } from "@/mocks/profile";
import { useState } from "react";
import jwt from "jsonwebtoken";
import { Toaster } from "react-hot-toast";

const loadedImages = new Set<string>();

export default function Providers({ accessToken, children }: any) {
	const noRefresh = {
		shouldRetryOnError: false,
		errorRetryCount: 0,
		revalidateOnFocus: false,
	};

	const {
		data: session,
		isLoading: sessionLoading,
		mutate: sessionMutate,
	} = useSWR("/user/profile", fetcher, noRefresh);
	const {
		data: verified,
		isLoading: verifiedLoading,
		mutate: verifiedMutate,
	} = useSWR("/auth/verify", fetcher, noRefresh);
	const [loadedImages, setLoadedImages] = useState<string[]>([]);
	const payload = jwt?.decode(accessToken?.value) as any;
	const twoFactorAuthenticated = payload?.two_factor_passed === true;

	console.log({
		session,
		sessionLoading,
		verified,
		verifiedLoading,
		accessToken,
	});

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
				fullMutate: () =>
					Promise.all([sessionMutate(), verifiedMutate()]),
				session: {
					...dummyUser,
					...(session as any),
				},
			}}
		>
			<NextUIProvider>{children}</NextUIProvider>
			<Toaster
				toastOptions={{
					className: "!bg-card-500 !text-white !p-4",
				}}
				position="bottom-left"
			/>
		</PublicContext.Provider>
	);
}
