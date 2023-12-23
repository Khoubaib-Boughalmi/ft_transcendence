"use client";

import PublicContext from "@/contexts/PublicContext";
import { NextUIProvider } from "@nextui-org/react";
import axios from "@/lib/axios";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { dummyUser } from "@/mocks/profile";
import { useState } from "react";

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
				fullMutate: () =>
					Promise.all([sessionMutate(), verifiedMutate()]),
				session: {
					...dummyUser,
					...(session as any),
				},
			}}
		>
			<NextUIProvider>{children}</NextUIProvider>
		</PublicContext.Provider>
	);
}
