"use client";
import { Metadata } from "next";
import { useEffect } from "react";

export default function Page() {
	useEffect(() => {
		document.title = "long enough";
	}, []);
	return <div></div>;
}
