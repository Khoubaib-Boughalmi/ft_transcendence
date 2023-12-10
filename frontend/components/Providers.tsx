"use client";

import PublicContext from "@/contexts/PublicContext";
import { NextUIProvider } from "@nextui-org/react";

export default function Providers({
    cookie,
    children
}: any) {
    return (
        <PublicContext.Provider value={{ cookie }}>
            <NextUIProvider>
                {children}
            </NextUIProvider>
        </PublicContext.Provider>
    )
}