"use client";

import { useRouter, redirect } from "next/navigation";
import { useContext } from "react";
import Error from "next/error";
import PublicContext from "@/contexts/PublicContext";

export default function Page() {
	const { session } = useContext(PublicContext) as any;
    const router = useRouter();

    if (session)
        redirect("/profile/" + session.username);

    return <Error statusCode={401} />	
}