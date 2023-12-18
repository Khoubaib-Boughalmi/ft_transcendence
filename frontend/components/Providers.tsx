"use client";

import PublicContext from "@/contexts/PublicContext";
import { NextUIProvider } from "@nextui-org/react";
import axios from "@/lib/axios";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { user1 } from "@/mocks/profile";

export default function Providers({
    cookie,
    children
}: any) {
    const { data: session, isLoading: sessionLoading } = useSWR("/user/profile", fetcher);

    return (
        <PublicContext.Provider value={{ cookie, sessionLoading, session: {
            ...user1,
            ...session as any
        } }}>
            <NextUIProvider>
                {children}
            </NextUIProvider>
        </PublicContext.Provider>
    )
}