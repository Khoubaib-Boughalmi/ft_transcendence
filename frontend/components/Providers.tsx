"use client";

import PublicContext from "@/contexts/PublicContext";

export default function Providers({
    cookie,
    children
}: any) {
    return (
        <PublicContext.Provider value={{ cookie }}>
            {children}
        </PublicContext.Provider>
    )
}