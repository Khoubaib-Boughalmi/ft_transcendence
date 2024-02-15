"use client";

import PublicContext from "@/contexts/PublicContext";
import Error from "next/error";
import { redirect, useRouter } from "next/navigation";
import { useContext } from "react";

export default function Page() {
	const { session, sessionLoading } = useContext(PublicContext) as any;
	const router = useRouter();

	if (session && !sessionLoading) redirect("/profile/" + session.username);

	if (!sessionLoading) return <Error statusCode={401} />;

	return null;
}
