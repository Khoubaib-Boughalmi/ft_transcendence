"use client";

import PublicContext from "@/contexts/PublicContext";
import { NextUIProvider } from "@nextui-org/react";
import axios from "@/lib/axios";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { dummyUser } from "@/mocks/profile";
import { useState } from "react";

const loadedImages = new Set<string>();

export default function Providers({
    cookie,
    children
}: any) {
    const { data: session, isLoading: sessionLoading, mutate: sessionMutate } = useSWR("/user/profile", fetcher);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);

    return (
        <PublicContext.Provider value={{ loadedImages, sessionMutate, setLoadedImages, cookie, sessionLoading, session: {
            ...dummyUser,
            ...session as any
        } }}>
            <NextUIProvider>
                {children}
            </NextUIProvider>
        </PublicContext.Provider>
    )
}